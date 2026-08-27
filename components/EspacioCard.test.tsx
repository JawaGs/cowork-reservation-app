import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EspacioCard } from "./EspacioCard";
import type { Espacio } from "@/lib/espacios";
import type { Market } from "@/lib/market";

const espacio: Espacio = {
  id: "1",
  nombre: "Providencia Hub",
  ubicacion: "Santiago",
  precioHoraUSD: 10,
  tipo: "escritorio-flexible",
};

describe("EspacioCard", () => {
  it("enlaza al detalle del espacio", () => {
    const market: Market = { code: "US", currency: "USD", locale: "en-US" };
    render(<EspacioCard espacio={espacio} market={market} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/espacios/1");
  });

  it("muestra nombre, ubicación y tipo", () => {
    const market: Market = { code: "US", currency: "USD", locale: "en-US" };
    render(<EspacioCard espacio={espacio} market={market} />);
    expect(screen.getByText("Providencia Hub")).toBeInTheDocument();
    expect(screen.getByText(/Santiago/)).toBeInTheDocument();
    expect(screen.getByText(/Escritorio flexible/)).toBeInTheDocument();
  });
});
