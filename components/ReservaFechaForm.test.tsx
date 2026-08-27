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
  it("actualiza la URL al cambiar la fecha", () => {
    render(<ReservaFechaForm espacio={espacio} />);
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-09-05" } });
    expect(replace).toHaveBeenCalledWith(
      expect.stringContaining("fecha=2026-09-05"),
    );
  });

  it("muestra el motivo de horario ocupado y no ofrece continuar", () => {
    currentParams = new URLSearchParams({
      espacioId: "1",
      fecha: "2026-09-01",
      horaInicio: "10:00",
      horaFin: "11:00",
    });
    render(<ReservaFechaForm espacio={espacio} />);
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
    render(<ReservaFechaForm espacio={espacio} />);
    expect(screen.getByText(/Duración: 2h/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
      "href",
      expect.stringContaining("/reserva/resumen"),
    );
  });
});
