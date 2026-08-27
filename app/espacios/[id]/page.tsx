import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ESPACIOS_MOCK, TIPO_LABELS } from "@/lib/espacios";
import { resolveMarket } from "@/lib/market";
import { formatPrice } from "@/lib/pricing";

export default async function EspacioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const espacio = ESPACIOS_MOCK.find((e) => e.id === id);

  if (!espacio) {
    notFound();
  }

  const headersList = await headers();
  const market = resolveMarket(headersList.get("accept-language"));

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{espacio.nombre}</h1>
      <p className="text-zinc-600 mt-1">
        {espacio.ubicacion} · {TIPO_LABELS[espacio.tipo]}
      </p>
      <p className="mt-4 font-medium">
        {formatPrice(espacio.precioHoraUSD, market)} / hora
      </p>
      <Link
        href={`/reserva/fecha?espacioId=${espacio.id}`}
        className="inline-block mt-6 border rounded px-4 py-2 bg-black text-white"
      >
        Reservar
      </Link>
    </main>
  );
}
