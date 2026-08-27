import { describe, expect, it } from "vitest";
import type { Espacio } from "./espacios";
import {
  calcularDuracionHoras,
  calcularPrecioUSD,
  esDiaCompleto,
  esFechaPasada,
  seSuperponeConOcupado,
  validarReserva,
} from "./disponibilidad";

const AHORA = new Date(2026, 7, 27); // 2026-08-27

const espacio: Espacio = {
  id: "1",
  nombre: "Providencia Hub",
  ubicacion: "Santiago",
  precioHoraUSD: 10,
  precioDiaUSD: 50,
  tipo: "escritorio-flexible",
  horariosOcupados: [{ fecha: "2026-09-01", horaInicio: "09:00", horaFin: "12:00" }],
};

describe("esFechaPasada", () => {
  it("es true para una fecha anterior a hoy", () => {
    expect(esFechaPasada("2026-08-26", AHORA)).toBe(true);
  });

  it("es false para hoy", () => {
    expect(esFechaPasada("2026-08-27", AHORA)).toBe(false);
  });

  it("es false para una fecha futura", () => {
    expect(esFechaPasada("2026-09-01", AHORA)).toBe(false);
  });
});

describe("calcularDuracionHoras", () => {
  it("calcula horas completas", () => {
    expect(calcularDuracionHoras("09:00", "12:00")).toBe(3);
  });

  it("calcula horas fraccionarias", () => {
    expect(calcularDuracionHoras("09:30", "11:00")).toBe(1.5);
  });
});

describe("esDiaCompleto", () => {
  it("es false a exactamente 6 horas", () => {
    expect(esDiaCompleto(6)).toBe(false);
  });

  it("es true por sobre 6 horas", () => {
    expect(esDiaCompleto(6.5)).toBe(true);
  });
});

describe("calcularPrecioUSD", () => {
  it("cobra por hora cuando la duración es de 6h o menos", () => {
    expect(calcularPrecioUSD(espacio, 4)).toBe(40);
  });

  it("cobra la tarifa plana de día completo por sobre 6h", () => {
    expect(calcularPrecioUSD(espacio, 8)).toBe(50);
  });
});

describe("seSuperponeConOcupado", () => {
  it("detecta superposición parcial", () => {
    expect(
      seSuperponeConOcupado(
        { fecha: "2026-09-01", horaInicio: "11:00", horaFin: "13:00" },
        espacio.horariosOcupados,
      ),
    ).toBe(true);
  });

  it("no detecta superposición en otra fecha", () => {
    expect(
      seSuperponeConOcupado(
        { fecha: "2026-09-02", horaInicio: "09:00", horaFin: "12:00" },
        espacio.horariosOcupados,
      ),
    ).toBe(false);
  });

  it("no detecta superposición cuando los rangos son adyacentes sin cruzarse", () => {
    expect(
      seSuperponeConOcupado(
        { fecha: "2026-09-01", horaInicio: "12:00", horaFin: "14:00" },
        espacio.horariosOcupados,
      ),
    ).toBe(false);
  });
});

describe("validarReserva", () => {
  it("rechaza fecha pasada", () => {
    expect(
      validarReserva(espacio, { fecha: "2026-08-01", horaInicio: "09:00", horaFin: "10:00" }, AHORA),
    ).toEqual({ valido: false, motivo: "fecha-pasada" });
  });

  it("rechaza horario ocupado", () => {
    expect(
      validarReserva(espacio, { fecha: "2026-09-01", horaInicio: "10:00", horaFin: "11:00" }, AHORA),
    ).toEqual({ valido: false, motivo: "horario-ocupado" });
  });

  it("rechaza rango inválido (fin antes o igual que inicio)", () => {
    expect(
      validarReserva(espacio, { fecha: "2026-09-05", horaInicio: "10:00", horaFin: "10:00" }, AHORA),
    ).toEqual({ valido: false, motivo: "rango-invalido" });
  });

  it("acepta una reserva válida", () => {
    expect(
      validarReserva(espacio, { fecha: "2026-09-05", horaInicio: "10:00", horaFin: "12:00" }, AHORA),
    ).toEqual({ valido: true });
  });
});
