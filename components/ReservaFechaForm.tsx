"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { calcularDuracionHoras, esDiaCompleto, validarReserva } from "@/lib/disponibilidad";
import type { Espacio } from "@/lib/espacios";
import type { PasoTrasFecha } from "@/lib/flujo";

interface ReservaFechaFormProps {
  espacio: Espacio;
  siguientePaso: PasoTrasFecha;
}

const MOTIVO_LABELS = {
  "fecha-pasada": "No se permiten fechas pasadas.",
  "horario-ocupado": "Ese horario ya está ocupado para este espacio.",
  "rango-invalido": "La hora de término debe ser posterior a la hora de inicio.",
} as const;

export function ReservaFechaForm({ espacio, siguientePaso }: ReservaFechaFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fecha = searchParams.get("fecha") ?? "";
  const horaInicio = searchParams.get("horaInicio") ?? "";
  const horaFin = searchParams.get("horaFin") ?? "";

  function actualizar(campo: "fecha" | "horaInicio" | "horaFin", valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("espacioId", espacio.id);
    params.set(campo, valor);
    router.replace(`/reserva/fecha?${params.toString()}`);
  }

  const completo = Boolean(fecha && horaInicio && horaFin);
  const resultado = completo
    ? validarReserva(espacio, { fecha, horaInicio, horaFin })
    : null;
  const duracion = completo ? calcularDuracionHoras(horaInicio, horaFin) : null;

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1">
        Fecha
        <input
          type="date"
          value={fecha}
          onChange={(e) => actualizar("fecha", e.target.value)}
          className="border px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1">
        Hora inicio
        <input
          type="time"
          value={horaInicio}
          onChange={(e) => actualizar("horaInicio", e.target.value)}
          className="border px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1">
        Hora fin
        <input
          type="time"
          value={horaFin}
          onChange={(e) => actualizar("horaFin", e.target.value)}
          className="border px-2 py-1"
        />
      </label>

      {resultado && !resultado.valido && resultado.motivo && (
        <p className="text-red-600 text-sm">{MOTIVO_LABELS[resultado.motivo]}</p>
      )}
      {resultado?.valido && duracion !== null && (
        <p className="text-sm text-zinc-600">
          Duración: {duracion}h{esDiaCompleto(duracion) ? " (tarifa día completo)" : ""}
        </p>
      )}

      {resultado?.valido ? (
        <Link
          href={`/reserva/${siguientePaso}?${new URLSearchParams({
            espacioId: espacio.id,
            fecha,
            horaInicio,
            horaFin,
          }).toString()}`}
          className="inline-block text-center border rounded px-4 py-2 bg-black text-white"
        >
          Continuar
        </Link>
      ) : (
        <span className="inline-block text-center border rounded px-4 py-2 bg-zinc-200 text-zinc-500">
          Continuar
        </span>
      )}
    </div>
  );
}
