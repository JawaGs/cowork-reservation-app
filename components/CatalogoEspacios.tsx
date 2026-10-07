"use client";

import { useMemo, useState } from "react";
import { EspacioCard } from "./EspacioCard";
import {
  TIPO_LABELS,
  filtrarEspacios,
  type Espacio,
  type EspacioFiltros,
  type TipoEspacio,
} from "@/lib/espacios";
import type { Market } from "@/lib/market";
import type { Layout } from "@/lib/layout";

interface CatalogoEspaciosProps {
  espacios: Espacio[];
  market: Market;
  layout: Layout;
}

export function CatalogoEspacios({ espacios, market, layout }: CatalogoEspaciosProps) {
  const [filtros, setFiltros] = useState<EspacioFiltros>({});

  const ubicaciones = useMemo(
    () => Array.from(new Set(espacios.map((e) => e.ubicacion))).sort(),
    [espacios],
  );

  const resultado = useMemo(
    () => filtrarEspacios(espacios, filtros),
    [espacios, filtros],
  );

  const hayFiltrosActivos = Boolean(filtros.busqueda || filtros.ubicacion || filtros.tipo);

  return (
    <div>
      <div className="flex flex-wrap gap-fluid-sm mb-fluid-md">
        <input
          type="text"
          placeholder="Buscar..."
          value={filtros.busqueda ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, busqueda: e.target.value || undefined }))
          }
          className="field"
        />
        <select
          value={filtros.ubicacion ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, ubicacion: e.target.value || undefined }))
          }
          className="field"
        >
          <option value="">Todas las ubicaciones</option>
          {ubicaciones.map((ubicacion) => (
            <option key={ubicacion} value={ubicacion}>
              {ubicacion}
            </option>
          ))}
        </select>
        <select
          value={filtros.tipo ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({
              ...f,
              tipo: (e.target.value || undefined) as TipoEspacio | undefined,
            }))
          }
          className="field"
        >
          <option value="">Todos los tipos</option>
          {(Object.keys(TIPO_LABELS) as TipoEspacio[]).map((tipo) => (
            <option key={tipo} value={tipo}>
              {TIPO_LABELS[tipo]}
            </option>
          ))}
        </select>
      </div>

      {resultado.length === 0 ? (
        <div>
          <p className="text-fluid-base text-muted">
            No hay espacios que coincidan con los filtros.
          </p>
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={() => setFiltros({})}
              className="mt-fluid-xs text-fluid-sm underline underline-offset-2 hover:text-foreground"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-fluid-sm"
              : "flex flex-col gap-fluid-sm"
          }
        >
          {resultado.map((espacio) => (
            <EspacioCard key={espacio.id} espacio={espacio} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
