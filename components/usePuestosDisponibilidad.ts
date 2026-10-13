import { useCallback, useEffect, useRef, useState } from "react";
import type { RangoReserva } from "@/lib/disponibilidad";
import type { Puesto, PuestosDisponibilidadResponse } from "@/lib/puestos";

export type EstadoDisponibilidad = "inactivo" | "cargando" | "exito" | "error";

export interface UsePuestosDisponibilidadResult {
  estado: EstadoDisponibilidad;
  puestos: Puesto[] | null;
  reintentar: () => void;
}

export function usePuestosDisponibilidad(
  espacioId: string,
  rango: RangoReserva | null,
): UsePuestosDisponibilidadResult {
  const fecha = rango?.fecha;
  const horaInicio = rango?.horaInicio;
  const horaFin = rango?.horaFin;
  const rangoKey = fecha && horaInicio && horaFin ? `${fecha}|${horaInicio}|${horaFin}` : null;

  const [estado, setEstado] = useState<EstadoDisponibilidad>(rangoKey ? "cargando" : "inactivo");
  const [puestos, setPuestos] = useState<Puesto[] | null>(null);
  const [reintentarTick, setReintentarTick] = useState(0);
  const [disparoProcesado, setDisparoProcesado] = useState({ rangoKey, tick: reintentarTick });
  const generacionRef = useRef(0);
  const intentoRef = useRef(1);
  const ultimoRangoKeyRef = useRef<string | null>(null);

  // Ajusta "estado" durante el render (no en el efecto) cuando rango o
  // reintentar() cambian — evita un setState "puro" en el cuerpo del
  // efecto que no acompaña ningún trabajo asíncrono real.
  if (disparoProcesado.rangoKey !== rangoKey || disparoProcesado.tick !== reintentarTick) {
    setDisparoProcesado({ rangoKey, tick: reintentarTick });
    setEstado(rangoKey ? "cargando" : "inactivo");
  }

  useEffect(() => {
    if (!fecha || !horaInicio || !horaFin) {
      ultimoRangoKeyRef.current = null;
      generacionRef.current += 1;
      return;
    }

    const key = `${fecha}|${horaInicio}|${horaFin}`;
    if (key !== ultimoRangoKeyRef.current) {
      ultimoRangoKeyRef.current = key;
      intentoRef.current = 1;
    } else {
      intentoRef.current += 1;
    }

    const generacion = ++generacionRef.current;

    const params = new URLSearchParams({
      fecha,
      horaInicio,
      horaFin,
      intento: String(intentoRef.current),
    });

    fetch(`/api/espacios/${espacioId}/puestos?${params.toString()}`)
      .then(async (response) => {
        if (generacionRef.current !== generacion) return;
        if (!response.ok) {
          setEstado("error");
          return;
        }
        const data = (await response.json()) as PuestosDisponibilidadResponse;
        setPuestos(data.puestos);
        setEstado("exito");
      })
      .catch(() => {
        if (generacionRef.current !== generacion) return;
        setEstado("error");
      });
  }, [espacioId, fecha, horaInicio, horaFin, reintentarTick]);

  const reintentar = useCallback(() => {
    setReintentarTick((tick) => tick + 1);
  }, []);

  return { estado, puestos, reintentar };
}
