import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { PagoForm } from "@/components/PagoForm";
import { ReservaError } from "@/components/ReservaError";
import { ReservaStepper } from "@/components/ReservaStepper";
import { validarReserva } from "@/lib/disponibilidad";
import { ESPACIOS_MOCK } from "@/lib/espacios";
import { VARIANT_COOKIE, type Variant } from "@/lib/experiment";

export default async function ReservaPagoPage({
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
        <ReservaStepper variant={variant} pasoActual="pago" params={params} />
        <ReservaError
          titulo="Pago"
          motivo={resultado.motivo}
          volverAFecha={`/reserva/fecha?${params.toString()}`}
        />
      </Container>
    );
  }

  const hrefConfirmacion = `/reserva/confirmacion?${params.toString()}`;

  return (
    <Container>
      <ReservaStepper variant={variant} pasoActual="pago" params={params} />
      <h1 className="text-fluid-2xl font-semibold tracking-tight mb-fluid-2xs">Pago</h1>
      <p className="text-fluid-base text-muted mb-fluid-md">
        {espacio.nombre} · {fecha} · {horaInicio}–{horaFin}
      </p>
      <PagoForm hrefConfirmacion={hrefConfirmacion} />
    </Container>
  );
}
