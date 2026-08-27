import { describe, expect, it } from "vitest";
import { flujoCondensado, pasoTrasFecha } from "./flujo";

describe("pasoTrasFecha", () => {
  it("va a resumen para base", () => {
    expect(pasoTrasFecha("base")).toBe("resumen");
  });

  it("va a resumen para la variante a", () => {
    expect(pasoTrasFecha("a")).toBe("resumen");
  });

  it("va directo a pago para la variante b", () => {
    expect(pasoTrasFecha("b")).toBe("pago");
  });
});

describe("flujoCondensado", () => {
  it("es false para base y a", () => {
    expect(flujoCondensado("base")).toBe(false);
    expect(flujoCondensado("a")).toBe(false);
  });

  it("es true solo para b", () => {
    expect(flujoCondensado("b")).toBe(true);
  });
});
