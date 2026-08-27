import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReservaFechaForm } from "./ReservaFechaForm";
import type { Espacio } from "@/lib/espacios";

const replace = vi.fn();
let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => currentParams,
}));

const espacio: Espacio = {
  id: "1",
  nombre: "Providencia Hub",
  ubicacion: "Santiago",
  precioHoraUSD: 10,
  precioDiaUSD: 50,
  tipo: "escritorio-flexible",
  horariosOcupados: [{ fecha: "2026-09-01", horaInicio: "09:00", horaFin: "12:00" }],
};

beforeEach(() => {
  replace.mockClear();
  currentParams = new URLSearchParams();
});

describe("ReservaFechaForm", () => {
  it("actualiza la URL al elegir una fecha en el date picker", () => {
    render(<ReservaFechaForm espacio={espacio} siguientePaso="resumen" />);
    fireEvent.click(screen.getByRole("button", { name: "Fecha" }));
    // Navega al mes siguiente para no depender de qué día es "hoy" al correr el test.
    fireEvent.click(screen.getByRole("button", { name: "Mes siguiente" }));
    fireEvent.click(screen.getByRole("button", { name: "15" }));
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
      fecha: "2026-09-01",
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
      fecha: "2026-09-05",
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
      fecha: "2026-09-05",
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
      fecha: "2026-09-05",
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
      fecha: "2026-09-05",
      horaInicio: "10:00",
      horaFin: "12:00",
    });
    render(<ReservaFechaForm espacio={espacio} siguientePaso="pago" />);
    expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
      "href",
      expect.stringContaining("/reserva/pago"),
    );
  });
});
