import Link from "next/link";
import { TIPO_LABELS, type Espacio } from "@/lib/espacios";
import { formatPrice } from "@/lib/pricing";
import type { Market } from "@/lib/market";

interface EspacioCardProps {
  espacio: Espacio;
  market: Market;
}

export function EspacioCard({ espacio, market }: EspacioCardProps) {
  return (
    <Link
      href={`/espacios/${espacio.id}`}
      className="card block transition-colors hover:border-accent"
    >
      <h2 className="text-fluid-lg font-semibold tracking-tight">{espacio.nombre}</h2>
      <p className="mt-1 text-fluid-sm text-muted">
        {espacio.ubicacion} · {TIPO_LABELS[espacio.tipo]}
      </p>
      <p className="mt-fluid-2xs text-fluid-base font-medium">
        {formatPrice(espacio.precioHoraUSD, market)}{" "}
        <span className="font-normal text-muted">/ hora</span>
      </p>
    </Link>
  );
}
