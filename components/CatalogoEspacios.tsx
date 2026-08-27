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

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar..."
          value={filtros.busqueda ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, busqueda: e.target.value || undefined }))
          }
          className="border px-2 py-1"
        />
        <select
          value={filtros.ubicacion ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, ubicacion: e.target.value || undefined }))
          }
          className="border px-2 py-1"
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
          className="border px-2 py-1"
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
        <p>No hay espacios que coincidan con los filtros.</p>
      ) : (
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-4"
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
