import { cookies, headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmacionPago } from "@/components/ConfirmacionPago";
import {
  calcularDuracionHoras,
  calcularPrecioUSD,
  esDiaCompleto,
  validarReserva,
} from "@/lib/disponibilidad";
import { ESPACIOS_MOCK, TIPO_LABELS } from "@/lib/espacios";
import { VARIANT_COOKIE, type Variant } from "@/lib/experiment";
import { flujoCondensado } from "@/lib/flujo";
import { resolveMarket } from "@/lib/market";
import { formatPrice } from "@/lib/pricing";

const MOTIVO_LABELS = {
  "fecha-pasada": "No se permiten fechas pasadas.",
  "horario-ocupado": "Ese horario ya está ocupado para este espacio.",
  "rango-invalido": "La hora de término debe ser posterior a la hora de inicio.",
} as const;

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
  const volverAFecha = `/reserva/fecha?${params.toString()}`;

  if (!resultado.valido) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Confirmación</h1>
        <p className="text-red-600 mb-4">
          {resultado.motivo ? MOTIVO_LABELS[resultado.motivo] : "Reserva inválida."}
        </p>
        <Link href={volverAFecha} className="underline">
          Volver a elegir fecha y hora
        </Link>
      </main>
    );
  }

  const cookieStore = await cookies();
  const variant = (cookieStore.get(VARIANT_COOKIE)?.value as Variant | undefined) ?? "base";
  const condensado = flujoCondensado(variant);

  const headersList = await headers();
  const market = resolveMarket(headersList.get("accept-language"));
  const duracion = calcularDuracionHoras(horaInicio, horaFin);
  const precioUSD = calcularPrecioUSD(espacio, duracion);
  const hrefPago = `/reserva/pago?${params.toString()}`;

  if (!condensado) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-2">¡Reserva confirmada!</h1>
        <p className="text-zinc-600 mb-6">
          {espacio.nombre} · {fecha} · {horaInicio}–{horaFin}
        </p>
        <ConfirmacionPago hrefPago={hrefPago} />
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Resumen y confirmación de la reserva</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 max-w-sm mb-6">
        <dt className="text-zinc-600">Espacio</dt>
        <dd>{espacio.nombre}</dd>
        <dt className="text-zinc-600">Ubicación</dt>
        <dd>{espacio.ubicacion}</dd>
        <dt className="text-zinc-600">Tipo</dt>
        <dd>{TIPO_LABELS[espacio.tipo]}</dd>
        <dt className="text-zinc-600">Fecha</dt>
        <dd>{fecha}</dd>
        <dt className="text-zinc-600">Horario</dt>
        <dd>
          {horaInicio} – {horaFin}
        </dd>
        <dt className="text-zinc-600">Duración</dt>
        <dd>
          {duracion}h{esDiaCompleto(duracion) ? " (tarifa día completo)" : ""}
        </dd>
        <dt className="text-zinc-600">Precio total</dt>
        <dd className="font-medium">{formatPrice(precioUSD, market)}</dd>
      </dl>
      <ConfirmacionPago hrefPago={hrefPago} />
    </main>
  );
}
