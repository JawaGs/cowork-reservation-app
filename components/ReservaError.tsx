import Link from "next/link";
import type { ResultadoValidacion } from "@/lib/disponibilidad";

const MOTIVO_LABELS = {
  "fecha-pasada": "No se permiten fechas pasadas.",
  "horario-ocupado": "Ese horario ya está ocupado para este espacio.",
  "rango-invalido": "La hora de término debe ser posterior a la hora de inicio.",
} as const;

interface ReservaErrorProps {
  titulo: string;
  motivo?: ResultadoValidacion["motivo"];
  volverAFecha: string;
}

export function ReservaError({ titulo, motivo, volverAFecha }: ReservaErrorProps) {
  return (
    <>
      <h1 className="text-fluid-xl font-semibold tracking-tight mb-fluid-xs">{titulo}</h1>
      <p className="text-fluid-base text-red-600 dark:text-red-400 mb-fluid-sm">
        {motivo ? MOTIVO_LABELS[motivo] : "Reserva inválida."}
      </p>
      <Link href={volverAFecha} className="text-fluid-sm underline underline-offset-2">
        Volver a elegir fecha y hora
      </Link>
    </>
  );
}
