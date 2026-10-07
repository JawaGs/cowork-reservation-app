import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { ConfirmacionPago } from "@/components/ConfirmacionPago";
import { Container } from "@/components/Container";
import { ReservaError } from "@/components/ReservaError";
import { ReservaResumenDetalle } from "@/components/ReservaResumenDetalle";
import { ReservaStepper } from "@/components/ReservaStepper";
import { calcularDuracionHoras, calcularPrecioUSD, validarReserva } from "@/lib/disponibilidad";
import { ESPACIOS_MOCK } from "@/lib/espacios";
import { VARIANT_COOKIE, type Variant } from "@/lib/experiment";
import { flujoCondensado } from "@/lib/flujo";
import { formatDate, resolveMarket } from "@/lib/market";

export default async function ReservaConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{
    espacioId?: string;
    fecha?: string;
    horaInicio?: string;
    horaFin?: string;
  }>;
}) {
  const { espacioId, fecha, horaInicio, horaFin } = await searchParams;
  const espacio = ESPACIOS_MOCK.find((e) => e.id === espacioId);

  if (!espacio || !fecha || !horaInicio || !horaFin) {
    notFound();
  }

  const rango = { fecha, horaInicio, horaFin };
  const resultado = validarReserva(espacio, rango);
  const params = new URLSearchParams({
    espacioId: espacio.id,
    fecha,
    horaInicio,
    horaFin,
  });

  const cookieStore = await cookies();
  const variant = (cookieStore.get(VARIANT_COOKIE)?.value as Variant | undefined) ?? "base";

  if (!resultado.valido) {
    return (
      <Container>
        <ReservaStepper variant={variant} pasoActual="confirmacion" params={params} />
        <ReservaError
          titulo="Confirmación"
          motivo={resultado.motivo}
          volverAFecha={`/reserva/fecha?${params.toString()}`}
        />
      </Container>
    );
  }

  const condensado = flujoCondensado(variant);

  const headersList = await headers();
  const market = resolveMarket(headersList.get("accept-language"));
  const duracion = calcularDuracionHoras(horaInicio, horaFin);
  const precioUSD = calcularPrecioUSD(espacio, duracion);
  const hrefPago = `/reserva/pago?${params.toString()}`;

  if (!condensado) {
    return (
      <Container>
        <ReservaStepper variant={variant} pasoActual="confirmacion" params={params} />
        <h1 className="text-fluid-2xl font-semibold tracking-tight mb-fluid-2xs">
          ¡Reserva confirmada!
        </h1>
        <p className="text-fluid-base text-muted mb-fluid-md">
          {espacio.nombre} · {formatDate(fecha, market)} · {horaInicio}–{horaFin}
        </p>
        <ConfirmacionPago hrefPago={hrefPago} />
      </Container>
    );
  }

  return (
    <Container>
      <ReservaStepper variant={variant} pasoActual="confirmacion" params={params} />
      <h1 className="text-fluid-2xl font-semibold tracking-tight mb-fluid-md">
        Resumen y confirmación de la reserva
      </h1>
      <ReservaResumenDetalle
        espacio={espacio}
        fecha={fecha}
        horaInicio={horaInicio}
        horaFin={horaFin}
        duracion={duracion}
        precioUSD={precioUSD}
        market={market}
      />
      <div className="mt-fluid-md">
        <ConfirmacionPago hrefPago={hrefPago} />
      </div>
    </Container>
  );
}
