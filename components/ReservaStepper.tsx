import Link from "next/link";
import { pasosDelFlujo, type PasoFlujo } from "@/lib/flujo";
import type { Variant } from "@/lib/experiment";

interface ReservaStepperProps {
  variant: Variant;
  pasoActual: PasoFlujo;
  params: URLSearchParams;
}

const LABELS: Record<PasoFlujo, string> = {
  fecha: "Fecha",
  resumen: "Resumen",
  pago: "Pago",
  confirmacion: "Confirmación",
};

export function ReservaStepper({ variant, pasoActual, params }: ReservaStepperProps) {
  const pasos = pasosDelFlujo(variant);
  const indiceActual = pasos.indexOf(pasoActual);

  return (
    <ol className="mb-fluid-md flex flex-wrap items-center gap-fluid-2xs text-fluid-sm">
      <li className="flex items-center gap-fluid-2xs">
        <Link
          href="/"
          className="underline underline-offset-2 text-muted hover:text-foreground"
        >
          Inicio
        </Link>
      </li>
      {pasos.map((paso, indice) => {
        const esActual = indice === indiceActual;
        const esCompletado = indice < indiceActual;

        return (
          <li key={paso} className="flex items-center gap-fluid-2xs">
            <span className="text-border">→</span>
            {esCompletado ? (
              <Link
                href={`/reserva/${paso}?${params.toString()}`}
                className="underline underline-offset-2 text-muted hover:text-foreground"
              >
                {LABELS[paso]}
              </Link>
            ) : (
              <span className={esActual ? "font-medium text-foreground" : "text-border"}>
                {LABELS[paso]}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
