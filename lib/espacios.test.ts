import { describe, expect, it } from "vitest";
import { ESPACIOS_MOCK, filtrarEspacios } from "./espacios";

describe("filtrarEspacios", () => {
  it("filtra por ubicación", () => {
    const resultado = filtrarEspacios(ESPACIOS_MOCK, { ubicacion: "Berlín" });
    expect(resultado).toHaveLength(3);
    expect(resultado.every((e) => e.ubicacion === "Berlín")).toBe(true);
  });

  it("filtra por tipo", () => {
    const resultado = filtrarEspacios(ESPACIOS_MOCK, { tipo: "sala-reuniones" });
    expect(resultado.every((e) => e.tipo === "sala-reuniones")).toBe(true);
  });

  it("filtra por búsqueda de texto libre sobre nombre o ubicación, sin importar mayúsculas", () => {
    const resultado = filtrarEspacios(ESPACIOS_MOCK, { busqueda: "manhattan" });
    expect(resultado.map((e) => e.id)).toEqual(["4"]);
  });

  it("combina filtros", () => {
    const resultado = filtrarEspacios(ESPACIOS_MOCK, {
      ubicacion: "Santiago",
      tipo: "oficina-privada",
    });
    expect(resultado.map((e) => e.id)).toEqual(["2"]);
  });

  it("devuelve todos los espacios cuando no hay filtros", () => {
    expect(filtrarEspacios(ESPACIOS_MOCK, {})).toHaveLength(ESPACIOS_MOCK.length);
  });

  it("devuelve vacío cuando ningún espacio matchea", () => {
    expect(filtrarEspacios(ESPACIOS_MOCK, { busqueda: "no-existe" })).toEqual([]);
  });
});
