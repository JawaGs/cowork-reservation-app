"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DatePicker } from "@/components/DatePicker";
import { LinkPendingLabel } from "@/components/LinkPendingLabel";
import { TimeSelect } from "@/components/TimeSelect";
import { calcularDuracionHoras, esDiaCompleto, validarReserva } from "@/lib/disponibilidad";
import type { Espacio } from "@/lib/espacios";
import type { PasoTrasFecha } from "@/lib/flujo";

function hoyISO(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

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
    // Si la nueva hora de inicio deja a la hora de fin ya elegida sin sentido,
    // se limpia en vez de dejar un valor obsoleto que el <select> ya no puede mostrar.
    if (campo === "horaInicio" && horaFin && horaFin <= valor) {
      params.delete("horaFin");
    }
    router.replace(`/reserva/fecha?${params.toString()}`);
  }

  const completo = Boolean(fecha && horaInicio && horaFin);
  const resultado = completo
    ? validarReserva(espacio, { fecha, horaInicio, horaFin })
    : null;
  const duracion = completo ? calcularDuracionHoras(horaInicio, horaFin) : null;

  return (
    <div className="flex flex-col gap-fluid-sm">
      <label className="flex flex-col gap-fluid-2xs text-fluid-sm">
        Fecha
        <DatePicker
          value={fecha}
          onChange={(valor) => actualizar("fecha", valor)}
          minDate={hoyISO()}
        />
      </label>
      <TimeSelect
        label="Hora inicio"
        value={horaInicio}
        onChange={(valor) => actualizar("horaInicio", valor)}
      />
      <TimeSelect
        label="Hora fin"
        value={horaFin}
        onChange={(valor) => actualizar("horaFin", valor)}
        min={horaInicio || undefined}
      />

      {resultado && !resultado.valido && resultado.motivo && (
        <p className="text-fluid-sm text-red-600 dark:text-red-400">
          {MOTIVO_LABELS[resultado.motivo]}
        </p>
      )}
      {resultado?.valido && duracion !== null && (
        <p className="text-fluid-sm text-muted">
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
          prefetch={false}
          className="btn-primary text-center"
        >
          <LinkPendingLabel>Continuar</LinkPendingLabel>
        </Link>
      ) : (
        <span className="btn-primary-disabled text-center">Continuar</span>
      )}
    </div>
  );
}
