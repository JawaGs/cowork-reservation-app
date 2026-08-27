import type { Variant } from "./experiment";

export type Layout = "grid" | "lista";

export function layoutForVariant(variant: Variant): Layout {
  return variant === "a" ? "lista" : "grid";
}
