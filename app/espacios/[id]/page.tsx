import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
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
    <Container>
      <h1 className="text-fluid-2xl font-semibold tracking-tight">{espacio.nombre}</h1>
      <p className="mt-fluid-2xs text-fluid-base text-muted">
        {espacio.ubicacion} · {TIPO_LABELS[espacio.tipo]}
      </p>
      <p className="mt-fluid-sm text-fluid-xl font-medium">
        {formatPrice(espacio.precioHoraUSD, market)}{" "}
        <span className="text-fluid-base font-normal text-muted">/ hora</span>
      </p>
      <Link
        href={`/reserva/fecha?espacioId=${espacio.id}`}
        className="btn-primary mt-fluid-md"
      >
        Reservar
      </Link>
    </Container>
  );
}
