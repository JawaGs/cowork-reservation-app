import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReservaStepper } from "./ReservaStepper";

const params = new URLSearchParams({
  espacioId: "1",
  fecha: "2026-10-20",
  horaInicio: "09:00",
  horaFin: "11:00",
});

describe("ReservaStepper", () => {
  it("muestra los 4 pasos para base, con los anteriores como link", () => {
    render(<ReservaStepper variant="base" pasoActual="pago" params={params} />);

    expect(screen.getByRole("link", { name: "Fecha" })).toHaveAttribute(
      "href",
      `/reserva/fecha?${params.toString()}`,
    );
    expect(screen.getByRole("link", { name: "Resumen" })).toHaveAttribute(
      "href",
      `/reserva/resumen?${params.toString()}`,
    );
    // El paso actual no es un link.
    expect(screen.queryByRole("link", { name: "Pago" })).not.toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
    // Los pasos futuros tampoco son link.
    expect(screen.queryByRole("link", { name: "Confirmación" })).not.toBeInTheDocument();
  });

  it("muestra solo 3 pasos (sin resumen) para la variante b", () => {
    render(<ReservaStepper variant="b" pasoActual="confirmacion" params={params} />);

    expect(screen.queryByText("Resumen")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fecha" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pago" })).toBeInTheDocument();
  });

  it("no ofrece ningún link cuando el paso actual es el primero", () => {
    render(<ReservaStepper variant="base" pasoActual="fecha" params={params} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
