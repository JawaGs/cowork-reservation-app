import { describe, expect, it } from "vitest";
import {
  anunciarPuesto,
  calcularDisponibilidad,
  debeFallar,
  primerPuestoLibre,
  siguientePuestoLibre,
} from "./puestos";

describe("calcularDisponibilidad", () => {
  it("calcularDisponibilidad devuelve 8 puestos con ids '1' a '8'", () => {
    const puestos = calcularDisponibilidad("1", "2026-09-05", "10:00", "12:00");
    expect(puestos.map((p) => p.id)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
  });

  it("calcularDisponibilidad es determinista: la misma entrada siempre da el mismo resultado", () => {
    const a = calcularDisponibilidad("1", "2026-09-05", "10:00", "12:00");
    const b = calcularDisponibilidad("1", "2026-09-05", "10:00", "12:00");
    expect(a).toEqual(b);
  });

  it("calcularDisponibilidad varía según la fecha", () => {
    const a = calcularDisponibilidad("1", "2026-09-05", "10:00", "12:00");
    const b = calcularDisponibilidad("1", "2026-09-06", "10:00", "12:00");
    expect(a).not.toEqual(b);
  });
});

describe("debeFallar", () => {
  it("AC-09: debeFallar es true en el primer intento de un rango con fecha día 13", () => {
    expect(debeFallar("2026-09-13", 1)).toBe(true);
  });

  it("AC-09: debeFallar es false en el segundo intento de la misma fecha día 13", () => {
    expect(debeFallar("2026-09-13", 2)).toBe(false);
  });

  it("AC-22: debeFallar es false para una fecha que no es día 13, en cualquier intento", () => {
    expect(debeFallar("2026-09-05", 1)).toBe(false);
    expect(debeFallar("2026-09-05", 2)).toBe(false);
  });
});

describe("primerPuestoLibre y siguientePuestoLibre", () => {
  const puestos = [
    { id: "1", libre: false },
    { id: "2", libre: true },
    { id: "3", libre: false },
    { id: "4", libre: true },
    { id: "5", libre: true },
    { id: "6", libre: false },
    { id: "7", libre: false },
    { id: "8", libre: false },
  ];

  it("AC-11: primerPuestoLibre devuelve el primer id libre en orden", () => {
    expect(primerPuestoLibre(puestos)).toBe("2");
  });

  it("AC-11: siguientePuestoLibre devuelve el próximo puesto libre en orden de id", () => {
    expect(siguientePuestoLibre(puestos, "2", 1)).toBe("4");
    expect(siguientePuestoLibre(puestos, "4", -1)).toBe("2");
  });

  it("AC-17: siguientePuestoLibre devuelve null si no hay más puestos libres en esa dirección", () => {
    expect(siguientePuestoLibre(puestos, "5", 1)).toBe(null);
    expect(siguientePuestoLibre(puestos, "2", -1)).toBe(null);
  });
});

describe("anunciarPuesto", () => {
  it("AC-12: anunciarPuesto arma el texto exacto para cada estado", () => {
    expect(anunciarPuesto("3", "cargando")).toBe("Puesto 3, cargando disponibilidad");
    expect(anunciarPuesto("3", "libre")).toBe("Puesto 3, libre");
    expect(anunciarPuesto("3", "ocupado")).toBe("Puesto 3, ocupado");
    expect(anunciarPuesto("3", "seleccionado")).toBe("Puesto 3, seleccionado");
  });
});
