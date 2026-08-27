import { describe, expect, it } from "vitest";
import { formatDate, resolveMarket } from "./market";

describe("resolveMarket", () => {
  it("mapea región LATAM a CLP", () => {
    expect(resolveMarket("es-CL,es;q=0.9")).toEqual({
      code: "LATAM",
      currency: "CLP",
      locale: "es-CL",
    });
  });

  it("mapea región US a USD", () => {
    expect(resolveMarket("en-US,en;q=0.9")).toEqual({
      code: "US",
      currency: "USD",
      locale: "en-US",
    });
  });

  it("mapea región eurozona a EUR", () => {
    expect(resolveMarket("fr-FR,fr;q=0.9")).toEqual({
      code: "EU",
      currency: "EUR",
      locale: "fr-FR",
    });
  });

  it("prioriza región sobre idioma: es-ES cae en EU, no LATAM", () => {
    expect(resolveMarket("es-ES,es;q=0.9")).toEqual({
      code: "EU",
      currency: "EUR",
      locale: "es-ES",
    });
  });

  it("hace fallback a US/USD cuando la región no matchea ningún mercado", () => {
    expect(resolveMarket("en-CA,en;q=0.9")).toEqual({
      code: "US",
      currency: "USD",
      locale: "en-US",
    });
  });

  it("hace fallback a US/USD cuando no hay header", () => {
    expect(resolveMarket(null)).toEqual({
      code: "US",
      currency: "USD",
      locale: "en-US",
    });
  });

  it("hace fallback a US/USD cuando ningún tag trae subregión", () => {
    expect(resolveMarket("es,en;q=0.5")).toEqual({
      code: "US",
      currency: "USD",
      locale: "en-US",
    });
  });
});

describe("formatDate", () => {
  it("formatea en español largo para el mercado LATAM", () => {
    expect(formatDate("2026-09-05", { code: "LATAM", currency: "CLP", locale: "es-CL" })).toBe(
      "5 de septiembre de 2026",
    );
  });

  it("formatea en inglés largo para el mercado US", () => {
    expect(formatDate("2026-09-05", { code: "US", currency: "USD", locale: "en-US" })).toBe(
      "September 5, 2026",
    );
  });

  it("formatea en francés largo para el mercado EU", () => {
    expect(formatDate("2026-09-05", { code: "EU", currency: "EUR", locale: "fr-FR" })).toBe(
      "5 septembre 2026",
    );
  });

  it("no corre un día por interpretación UTC (caso límite: primer día del mes)", () => {
    expect(formatDate("2026-01-01", { code: "US", currency: "USD", locale: "en-US" })).toBe(
      "January 1, 2026",
    );
  });
});
