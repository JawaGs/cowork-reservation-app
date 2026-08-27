import { describe, expect, it } from "vitest";
import { convertPrice } from "./pricing";

describe("convertPrice", () => {
  it("no convierte para USD", () => {
    expect(convertPrice(10, "USD")).toBe(10);
  });

  it("convierte a CLP con la tasa fija mock", () => {
    expect(convertPrice(10, "CLP")).toBe(9500);
  });

  it("convierte a EUR con la tasa fija mock", () => {
    expect(convertPrice(10, "EUR")).toBeCloseTo(9.2);
  });
});
