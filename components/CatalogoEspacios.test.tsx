import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CatalogoEspacios } from "./CatalogoEspacios";
import type { Espacio } from "@/lib/espacios";
import type { Market } from "@/lib/market";

const espacios: Espacio[] = [
  { id: "1", nombre: "Providencia Hub", ubicacion: "Santiago", precioHoraUSD: 8, precioDiaUSD: 40, tipo: "escritorio-flexible", horariosOcupados: [] },
  { id: "2", nombre: "Manhattan Desk", ubicacion: "Nueva York", precioHoraUSD: 18, precioDiaUSD: 90, tipo: "escritorio-flexible", horariosOcupados: [] },
];

const market: Market = { code: "US", currency: "USD", locale: "en-US" };

describe("CatalogoEspacios", () => {
  it("renderiza en grid cuando layout=grid", () => {
    const { container } = render(
      <CatalogoEspacios espacios={espacios} market={market} layout="grid" />,
    );
    expect(container.querySelector(".grid")).toBeInTheDocument();
  });

  it("renderiza en lista (sin clase grid) cuando layout=lista", () => {
    const { container } = render(
      <CatalogoEspacios espacios={espacios} market={market} layout="lista" />,
    );
    expect(container.querySelector(".grid")).not.toBeInTheDocument();
  });

  it("filtra resultados al escribir en la búsqueda", async () => {
    const user = userEvent.setup();
    render(<CatalogoEspacios espacios={espacios} market={market} layout="grid" />);

    await user.type(screen.getByPlaceholderText("Buscar..."), "manhattan");

    expect(screen.getByText("Manhattan Desk")).toBeInTheDocument();
    expect(screen.queryByText("Providencia Hub")).not.toBeInTheDocument();
  });

  it("muestra un mensaje cuando no hay resultados", async () => {
    const user = userEvent.setup();
    render(<CatalogoEspacios espacios={espacios} market={market} layout="grid" />);

    await user.type(screen.getByPlaceholderText("Buscar..."), "no-existe");

    expect(screen.getByText(/no hay espacios/i)).toBeInTheDocument();
  });

  it("ofrece limpiar filtros cuando no hay resultados, y restaura el catálogo al hacer clic", async () => {
    const user = userEvent.setup();
    render(<CatalogoEspacios espacios={espacios} market={market} layout="grid" />);

    await user.type(screen.getByPlaceholderText("Buscar..."), "no-existe");
    const limpiar = screen.getByRole("button", { name: "Limpiar filtros" });
    expect(limpiar).toBeInTheDocument();

    await user.click(limpiar);

    expect(screen.getByText("Providencia Hub")).toBeInTheDocument();
    expect(screen.getByText("Manhattan Desk")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpiar filtros" })).not.toBeInTheDocument();
  });
});
