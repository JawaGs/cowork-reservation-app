import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { LinkPendingLabel } from "@/components/LinkPendingLabel";
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
      <Link
        href="/"
        className="text-fluid-sm text-muted underline underline-offset-2 hover:text-foreground"
      >
        ← Volver al catálogo
      </Link>
      <h1 className="mt-fluid-sm text-fluid-2xl font-semibold tracking-tight">
        {espacio.nombre}
      </h1>
      <p className="mt-fluid-2xs text-fluid-base text-muted">
        {espacio.ubicacion} · {TIPO_LABELS[espacio.tipo]}
      </p>
      <p className="mt-fluid-sm text-fluid-xl font-medium">
        {formatPrice(espacio.precioHoraUSD, market)}{" "}
        <span className="text-fluid-base font-normal text-muted">/ hora</span>
      </p>
      <p className="mt-fluid-2xs text-fluid-xs text-muted">
        Reservas de más de 6 horas se cobran como tarifa de día completo:{" "}
        {formatPrice(espacio.precioDiaUSD, market)}.
      </p>
      <Link
        href={`/reserva/fecha?espacioId=${espacio.id}`}
        prefetch={false}
        className="btn-primary mt-fluid-md"
      >
        <LinkPendingLabel>Reservar</LinkPendingLabel>
      </Link>
    </Container>
  );
}
