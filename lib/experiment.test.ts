import { describe, expect, it } from "vitest";
import { pickVariant } from "./experiment";

describe("pickVariant", () => {
  it("asigna base para el 50% inferior [0, 0.5)", () => {
    expect(pickVariant(0)).toBe("base");
    expect(pickVariant(0.49)).toBe("base");
  });

  it("asigna variante a para [0.5, 0.75)", () => {
    expect(pickVariant(0.5)).toBe("a");
    expect(pickVariant(0.74)).toBe("a");
  });

  it("asigna variante b para [0.75, 1)", () => {
    expect(pickVariant(0.75)).toBe("b");
    expect(pickVariant(0.999)).toBe("b");
  });
});
