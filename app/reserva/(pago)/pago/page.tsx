import Link from "next/link";
import { notFound } from "next/navigation";
import { PagoForm } from "@/components/PagoForm";
import { validarReserva } from "@/lib/disponibilidad";
import { ESPACIOS_MOCK } from "@/lib/espacios";

const MOTIVO_LABELS = {
  "fecha-pasada": "No se permiten fechas pasadas.",
  "horario-ocupado": "Ese horario ya está ocupado para este espacio.",
  "rango-invalido": "La hora de término debe ser posterior a la hora de inicio.",
} as const;

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
  const volverAFecha = `/reserva/fecha?${new URLSearchParams({
    espacioId: espacio.id,
    fecha,
    horaInicio,
    horaFin,
  }).toString()}`;

  if (!resultado.valido) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Pago</h1>
        <p className="text-red-600 mb-4">
          {resultado.motivo ? MOTIVO_LABELS[resultado.motivo] : "Reserva inválida."}
        </p>
        <Link href={volverAFecha} className="underline">
          Volver a elegir fecha y hora
        </Link>
      </main>
    );
  }

  const hrefConfirmacion = `/reserva/confirmacion?${new URLSearchParams({
    espacioId: espacio.id,
    fecha,
    horaInicio,
    horaFin,
  }).toString()}`;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Pago</h1>
      <p className="text-zinc-600 mb-6">
        {espacio.nombre} · {fecha} · {horaInicio}–{horaFin}
      </p>
      <PagoForm hrefConfirmacion={hrefConfirmacion} />
    </main>
  );
}
