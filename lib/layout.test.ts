import { describe, expect, it } from "vitest";
import { layoutForVariant } from "./layout";

describe("layoutForVariant", () => {
  it("asigna grid a base", () => {
    expect(layoutForVariant("base")).toBe("grid");
  });

  it("asigna lista a la variante a", () => {
    expect(layoutForVariant("a")).toBe("lista");
  });

  it("asigna grid a la variante b", () => {
    expect(layoutForVariant("b")).toBe("grid");
  });
});
