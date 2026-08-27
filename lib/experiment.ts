export type Variant = "base" | "a" | "b";

export const VARIANT_COOKIE = "variant";

// Fase 6: Base 50% / Variante A 25% / Variante B 25%
const BASE_WEIGHT = 0.5;
const VARIANT_A_WEIGHT = 0.25;

export function pickVariant(random: number): Variant {
  if (random < BASE_WEIGHT) return "base";
  if (random < BASE_WEIGHT + VARIANT_A_WEIGHT) return "a";
  return "b";
}
