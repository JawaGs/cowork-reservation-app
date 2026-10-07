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

const campoClase =
  "border-b border-border bg-transparent px-1 py-fluid-2xs text-fluid-sm text-foreground outline-none focus:border-accent";

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
      <div className="flex flex-wrap gap-fluid-sm mb-fluid-md">
        <input
          type="text"
          placeholder="Buscar..."
          value={filtros.busqueda ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, busqueda: e.target.value || undefined }))
          }
          className={campoClase}
        />
        <select
          value={filtros.ubicacion ?? ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, ubicacion: e.target.value || undefined }))
          }
          className={campoClase}
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
          className={campoClase}
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
        <p className="text-fluid-base text-muted">
          No hay espacios que coincidan con los filtros.
        </p>
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
