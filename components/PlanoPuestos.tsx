"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { usePuestosDisponibilidad } from "@/components/usePuestosDisponibilidad";
import type { RangoReserva } from "@/lib/disponibilidad";
import {
  anunciarPuesto,
  CANTIDAD_PUESTOS,
  MENSAJE_ERROR_DISPONIBILIDAD,
  primerPuestoLibre,
  siguientePuestoLibre,
  type Direccion,
  type EstadoAnuncioPuesto,
} from "@/lib/puestos";

interface PlanoPuestosProps {
  espacioId: string;
  rango: RangoReserva | null;
  puestoIdSeleccionado: string | null;
  onSeleccionar: (puestoId: string | null) => void;
}

const COLUMNAS = 4;
const CELDA = 100;
const FILAS = Math.ceil(CANTIDAD_PUESTOS / COLUMNAS);

function posicion(indice: number): { x: number; y: number } {
  return { x: (indice % COLUMNAS) * CELDA, y: Math.floor(indice / COLUMNAS) * CELDA };
}

export function PlanoPuestos({
  espacioId,
  rango,
  puestoIdSeleccionado,
  onSeleccionar,
}: PlanoPuestosProps): ReactElement | null {
  const { estado, puestos, reintentar } = usePuestosDisponibilidad(espacioId, rango);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const reintentarBtnRef = useRef<HTMLButtonElement>(null);
  const botonRefs = useRef(new Map<string, HTMLButtonElement>());
  const [cursorId, setCursorId] = useState<string | null>(null);
  const montajeVerificadoRef = useRef(false);

  // Si el usuario reintentó (foco puesto a propósito en el contenedor, ver
  // handleReintentar) y vuelve a fallar, el foco pasa al botón Reintentar.
  // No roba el foco en el primer error, cuando pudo estar en cualquier lado.
  useEffect(() => {
    if (estado === "error" && document.activeElement === contenedorRef.current) {
      reintentarBtnRef.current?.focus();
    }
  }, [estado]);

  // AC-18: si se montó con un puestoId ya en la URL, se valida una sola vez
  // contra la primera respuesta exitosa (la inicial, o la de un reintento si
  // la primera falló) — nunca vuelve a correr después de esa resolución.
  useEffect(() => {
    if (montajeVerificadoRef.current || estado !== "exito" || !puestos) return;
    montajeVerificadoRef.current = true;
    if (puestoIdSeleccionado && !puestos.find((p) => p.id === puestoIdSeleccionado)?.libre) {
      onSeleccionar(null);
    }
  }, [estado, puestos, puestoIdSeleccionado, onSeleccionar]);

  if (!rango) return null;

  function handleReintentar() {
    contenedorRef.current?.focus();
    reintentar();
  }

  function handleSeleccionar(id: string, libre: boolean) {
    if (!libre || id === puestoIdSeleccionado) return;
    onSeleccionar(id);
  }

  const cargando = estado === "cargando" || estado === "inactivo";
  const sinLibres = estado === "exito" && puestos !== null && puestos.every((p) => !p.libre);
  const cursorEfectivo =
    cursorId && puestos?.find((p) => p.id === cursorId)?.libre
      ? cursorId
      : puestos
        ? primerPuestoLibre(puestos)
        : null;

  function handleKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
    if (!puestos) return;

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      if (!cursorEfectivo) return;
      const direccion: Direccion = e.key === "ArrowRight" ? 1 : -1;
      const siguiente = siguientePuestoLibre(puestos, cursorEfectivo, direccion);
      if (!siguiente) return;
      e.preventDefault();
      setCursorId(siguiente);
      botonRefs.current.get(siguiente)?.focus();
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      const id = (e.target as HTMLElement).dataset.puestoId;
      if (!id) return;
      const libre = puestos.find((p) => p.id === id)?.libre ?? false;
      e.preventDefault();
      handleSeleccionar(id, libre);
    }
  }

  return (
    <div className="card" ref={contenedorRef} tabIndex={-1}>
      {estado === "error" ? (
        <>
          <p role="status" className="text-fluid-sm text-muted">
            {MENSAJE_ERROR_DISPONIBILIDAD}
          </p>
          <button
            type="button"
            ref={reintentarBtnRef}
            onClick={handleReintentar}
            className="btn-primary mt-fluid-2xs"
          >
            Reintentar
          </button>
        </>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${COLUMNAS * CELDA} ${FILAS * CELDA}`}
            className="mx-auto w-full max-w-md"
            role="img"
            aria-label="Plano de puestos"
            onKeyDown={handleKeyDown}
          >
            {Array.from({ length: CANTIDAD_PUESTOS }, (_, indice) => {
              const id = String(indice + 1);
              const puesto = puestos?.find((p) => p.id === id);
              const libre = puesto?.libre ?? false;
              const seleccionado = id === puestoIdSeleccionado;
              const estadoAnuncio: EstadoAnuncioPuesto = cargando
                ? "cargando"
                : seleccionado
                  ? "seleccionado"
                  : libre
                    ? "libre"
                    : "ocupado";
              const { x, y } = posicion(indice);

              return (
                <foreignObject key={id} x={x} y={y} width={CELDA} height={CELDA}>
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) botonRefs.current.set(id, el);
                      else botonRefs.current.delete(id);
                    }}
                    data-puesto-id={id}
                    disabled={cargando}
                    tabIndex={!cargando && id === cursorEfectivo ? 0 : -1}
                    onClick={() => handleSeleccionar(id, libre)}
                    aria-label={anunciarPuesto(id, estadoAnuncio)}
                    className="flex h-full w-full items-center justify-center text-fluid-sm"
                  >
                    {!cargando && !libre ? "✕" : null}
                    {!cargando && seleccionado ? "✓" : null}
                  </button>
                </foreignObject>
              );
            })}
          </svg>
          {sinLibres && (
            <p role="status" className="mt-fluid-2xs text-center text-fluid-sm text-muted">
              No hay puestos disponibles para este horario
            </p>
          )}
        </>
      )}
    </div>
  );
}
