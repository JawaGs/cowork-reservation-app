import { describe, expect, it } from "vitest";
import { validarPago, type DatosPago } from "./pago";

const AHORA = new Date(2026, 7, 27); // 2026-08-27

const datosValidos: DatosPago = {
  numeroTarjeta: "4111111111111111",
  nombreTitular: "Jose Valor",
  expiracion: "09/26",
  cvv: "123",
};

describe("validarPago", () => {
  it("acepta datos válidos", () => {
    expect(validarPago(datosValidos, AHORA)).toEqual({ valido: true, errores: {} });
  });

  it("acepta el número de tarjeta con espacios", () => {
    expect(
      validarPago({ ...datosValidos, numeroTarjeta: "4111 1111 1111 1111" }, AHORA).valido,
    ).toBe(true);
  });

  it("rechaza un número de tarjeta con menos de 16 dígitos", () => {
    const resultado = validarPago({ ...datosValidos, numeroTarjeta: "411111" }, AHORA);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.numeroTarjeta).toBeDefined();
  });

  it("rechaza nombre de titular vacío", () => {
    const resultado = validarPago({ ...datosValidos, nombreTitular: "  " }, AHORA);
    expect(resultado.errores.nombreTitular).toBeDefined();
  });

  it("rechaza formato de expiración inválido", () => {
    const resultado = validarPago({ ...datosValidos, expiracion: "2026-09" }, AHORA);
    expect(resultado.errores.expiracion).toBeDefined();
  });

  it("rechaza una tarjeta vencida", () => {
    const resultado = validarPago({ ...datosValidos, expiracion: "01/20" }, AHORA);
    expect(resultado.errores.expiracion).toBeDefined();
  });

  it("acepta una tarjeta que vence el mes en curso", () => {
    const resultado = validarPago({ ...datosValidos, expiracion: "08/26" }, AHORA);
    expect(resultado.valido).toBe(true);
  });

  it("rechaza un CVV que no tiene 3 dígitos", () => {
    const resultado = validarPago({ ...datosValidos, cvv: "12" }, AHORA);
    expect(resultado.errores.cvv).toBeDefined();
  });
});
