import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { LinkPendingLabel } from "@/components/LinkPendingLabel";
import { ReservaError } from "@/components/ReservaError";
import { ReservaResumenDetalle } from "@/components/ReservaResumenDetalle";
import { ReservaStepper } from "@/components/ReservaStepper";
import { calcularDuracionHoras, calcularPrecioUSD, validarReserva } from "@/lib/disponibilidad";
import { ESPACIOS_MOCK } from "@/lib/espacios";
import { resolveMarket } from "@/lib/market";

export default async function ReservaResumenPage({
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

  if (!espacio) {
    notFound();
  }

  if (!fecha || !horaInicio || !horaFin) {
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

  if (!resultado.valido) {
    return (
      <Container>
        <ReservaStepper variant="base" pasoActual="resumen" params={params} />
        <ReservaError
          titulo="Resumen de la reserva"
          motivo={resultado.motivo}
          volverAFecha={`/reserva/fecha?${params.toString()}`}
        />
      </Container>
    );
  }

  const headersList = await headers();
  const market = resolveMarket(headersList.get("accept-language"));
  const duracion = calcularDuracionHoras(horaInicio, horaFin);
  const precioUSD = calcularPrecioUSD(espacio, duracion);

  return (
    <Container>
      {/* "resumen" solo existe en el flujo de 4 pasos (Base/A) — estar en esta
          página implica esa forma del flujo, sin importar la cookie real
          (un usuario B solo llega aquí tecleando la URL a mano). */}
      <ReservaStepper variant="base" pasoActual="resumen" params={params} />
      <h1 className="text-fluid-2xl font-semibold tracking-tight mb-fluid-md">
        Resumen de la reserva
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
      <Link
        href={`/reserva/pago?${params.toString()}`}
        prefetch={false}
        className="btn-primary mt-fluid-md"
      >
        <LinkPendingLabel>Continuar a pago</LinkPendingLabel>
      </Link>
    </Container>
  );
}
