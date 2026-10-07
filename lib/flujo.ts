import type { Variant } from "./experiment";

export type PasoTrasFecha = "resumen" | "pago";

// Fase 6: Base/A -> 4 pasos (fecha -> resumen -> pago -> confirmación)
// B -> 3 pasos (fecha -> pago -> resumen+confirmación fusionados)
export function pasoTrasFecha(variant: Variant): PasoTrasFecha {
  return variant === "b" ? "pago" : "resumen";
}

export function flujoCondensado(variant: Variant): boolean {
  return variant === "b";
}

export type PasoFlujo = "fecha" | "resumen" | "pago" | "confirmacion";

export function pasosDelFlujo(variant: Variant): PasoFlujo[] {
  return variant === "b"
    ? ["fecha", "pago", "confirmacion"]
    : ["fecha", "resumen", "pago", "confirmacion"];
}
