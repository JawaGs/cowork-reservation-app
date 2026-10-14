import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReservaFechaForm } from "./ReservaFechaForm";
import type { Espacio } from "@/lib/espacios";

const replace = vi.fn();
let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => currentParams,
}));

// Fechas relativas a "hoy" en vez de literales fijos: un literal como
// "2026-09-05" era futuro cuando se escribió el test, pero deja de serlo
// apenas el reloj real lo alcanza, y la regla de "no fechas pasadas"
// empieza a rechazarlo (correctamente) rompiendo el test.
function fechaFutura(diasDesdeHoy: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasDesdeHoy);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

const FECHA_OCUPADA = fechaFutura(5);
const FECHA_VALIDA = fechaFutura(10);

const espacio: Espacio = {
  id: "1",
  nombre: "Providencia Hub",
  ubicacion: "Santiago",
  precioHoraUSD: 10,
  precioDiaUSD: 50,
  tipo: "escritorio-flexible",
  horariosOcupados: [{ fecha: FECHA_OCUPADA, horaInicio: "09:00", horaFin: "12:00" }],
};

beforeEach(() => {
  replace.mockClear();
  currentParams = new URLSearchParams();
  // PlanoPuestos (dentro de ReservaFechaForm cuando el rango es válido)
  // dispara un fetch real por su cuenta; se deja pendiente para que estos
  // tests, que no inspeccionan ese plano, no dependan de una red real.
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ReservaFechaForm", () => {
  it("actualiza la URL al elegir una fecha en el date picker", () => {
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    fireEvent.click(screen.getByRole("button", { name: "Fecha" }));
    // Navega al mes siguiente para no depender de qué día es "hoy" al correr el test.
    fireEvent.click(screen.getByRole("button", { name: "Mes siguiente" }));
    fireEvent.click(screen.getByRole("button", { name: /^15 de/ }));
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("fecha="));
  });

  it("actualiza la URL al elegir hora inicio y hora fin", () => {
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    fireEvent.change(screen.getByLabelText("Hora inicio"), { target: { value: "09:00" } });
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("horaInicio=09%3A00"));
  });

  it("muestra el motivo de horario ocupado y no ofrece continuar", () => {
    currentParams = new URLSearchParams({
      espacioId: "1",
      fecha: FECHA_OCUPADA,
      horaInicio: "10:00",
      horaFin: "11:00",
    });
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    expect(screen.getByText(/ya está ocupado/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continuar" })).not.toBeInTheDocument();
  });

  it("habilita continuar y muestra la duración cuando la reserva es válida", () => {
    currentParams = new URLSearchParams({
      espacioId: "1",
      fecha: FECHA_VALIDA,
      horaInicio: "10:00",
      horaFin: "12:00",
    });
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    expect(screen.getByText(/Duración: 2h/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
      "href",
      expect.stringContaining("/reserva/resumen"),
    );
  });

  it("limpia hora fin si deja de ser válida al cambiar hora inicio", () => {
    currentParams = new URLSearchParams({
      espacioId: "1",
      fecha: FECHA_VALIDA,
      horaInicio: "10:00",
      horaFin: "12:00",
    });
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    fireEvent.change(screen.getByLabelText("Hora inicio"), { target: { value: "14:00" } });

    const url = new URL(replace.mock.calls[0][0], "http://localhost");
    expect(url.searchParams.get("horaInicio")).toBe("14:00");
    expect(url.searchParams.has("horaFin")).toBe(false);
  });

  it("conserva hora fin si sigue siendo válida al cambiar hora inicio", () => {
    currentParams = new URLSearchParams({
      espacioId: "1",
      fecha: FECHA_VALIDA,
      horaInicio: "10:00",
      horaFin: "16:00",
    });
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    fireEvent.change(screen.getByLabelText("Hora inicio"), { target: { value: "14:00" } });

    const url = new URL(replace.mock.calls[0][0], "http://localhost");
    expect(url.searchParams.get("horaFin")).toBe("16:00");
  });

  it("apunta directo a pago cuando el siguiente paso es pago (variante b)", () => {
    currentParams = new URLSearchParams({
      espacioId: "1",
      fecha: FECHA_VALIDA,
      horaInicio: "10:00",
      horaFin: "12:00",
    });
    render(<ReservaFechaForm espacio={espacio} siguientePaso="pago" />);
    expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
      "href",
      expect.stringContaining("/reserva/pago"),
    );
  });

  it("AC-01: no renderiza el plano de puestos si el espacio no es escritorio-flexible", () => {
    currentParams = new URLSearchParams({
      espacioId: "3",
      fecha: FECHA_VALIDA,
      horaInicio: "10:00",
      horaFin: "12:00",
    });
    const salaReuniones: Espacio = { ...espacio, id: "3", tipo: "sala-reuniones" };
    render(<ReservaFechaForm espacio={salaReuniones} siguientePaso="resumen" />);
    expect(screen.queryByRole("img", { name: "Plano de puestos" })).not.toBeInTheDocument();
  });

  it("AC-02: no renderiza el plano de puestos con un dato de fecha/hora inválido", () => {
    currentParams = new URLSearchParams({
      espacioId: "1",
      fecha: FECHA_OCUPADA,
      horaInicio: "10:00",
      horaFin: "11:00",
    });
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    expect(screen.queryByRole("img", { name: "Plano de puestos" })).not.toBeInTheDocument();
  });

  it("AC-23: no renderiza el plano de puestos con un campo de fecha/hora vacío", () => {
    currentParams = new URLSearchParams({
      espacioId: "1",
      fecha: FECHA_VALIDA,
      horaInicio: "10:00",
      // horaFin queda vacía a propósito.
    });
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    expect(screen.queryByRole("img", { name: "Plano de puestos" })).not.toBeInTheDocument();
  });
});
