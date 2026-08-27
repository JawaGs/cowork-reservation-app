import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("muestra un placeholder cuando no hay fecha seleccionada", () => {
    render(<DatePicker value="" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Selecciona una fecha" })).toBeInTheDocument();
  });

  it("muestra la fecha seleccionada formateada como DD/MM/YYYY", () => {
    render(<DatePicker value="2026-09-05" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "05/09/2026" })).toBeInTheDocument();
  });

  it("abre el calendario en el mes de la fecha seleccionada y permite elegir otro día", () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-09-05" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "05/09/2026" }));
    expect(screen.getByText("septiembre 2026")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "10" }));
    expect(onChange).toHaveBeenCalledWith("2026-09-10");
  });

  it("deshabilita los días anteriores a minDate", () => {
    render(<DatePicker value="" onChange={vi.fn()} minDate="2026-09-05" />);
    fireEvent.click(screen.getByRole("button", { name: "Selecciona una fecha" }));

    expect(screen.getByRole("button", { name: "1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "10" })).not.toBeDisabled();
  });

  it("no navega antes de minDate al hacer click en un día deshabilitado", () => {
    const onChange = vi.fn();
    render(<DatePicker value="" onChange={onChange} minDate="2026-09-05" />);
    fireEvent.click(screen.getByRole("button", { name: "Selecciona una fecha" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
