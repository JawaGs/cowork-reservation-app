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
      className="block border rounded p-4 hover:border-black"
    >
      <h2 className="font-semibold">{espacio.nombre}</h2>
      <p className="text-sm text-zinc-600">
        {espacio.ubicacion} · {TIPO_LABELS[espacio.tipo]}
      </p>
      <p className="mt-2 font-medium">
        {formatPrice(espacio.precioHoraUSD, market)} / hora
      </p>
    </Link>
  );
}
