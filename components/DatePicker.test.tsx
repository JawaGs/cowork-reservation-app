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

    fireEvent.click(screen.getByRole("button", { name: /^10 de/ }));
    expect(onChange).toHaveBeenCalledWith("2026-09-10");
  });

  it("deshabilita los días anteriores a minDate", () => {
    render(<DatePicker value="" onChange={vi.fn()} minDate="2026-09-05" />);
    fireEvent.click(screen.getByRole("button", { name: "Selecciona una fecha" }));

    expect(screen.getByRole("button", { name: /^1 de/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^10 de/ })).not.toBeDisabled();
  });

  it("no navega antes de minDate al hacer click en un día deshabilitado", () => {
    const onChange = vi.fn();
    render(<DatePicker value="" onChange={onChange} minDate="2026-09-05" />);
    fireEvent.click(screen.getByRole("button", { name: "Selecciona una fecha" }));
    fireEvent.click(screen.getByRole("button", { name: /^1 de/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("cada día expone la fecha completa como aria-label", () => {
    render(<DatePicker value="2026-09-05" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "05/09/2026" }));
    expect(screen.getByRole("button", { name: "5 de septiembre de 2026" })).toBeInTheDocument();
  });

  it("cierra el calendario al hacer clic fuera", () => {
    render(
      <div>
        <DatePicker value="2026-09-05" onChange={vi.fn()} />
        <button type="button">fuera</button>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "05/09/2026" }));
    expect(screen.getByText("septiembre 2026")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("button", { name: "fuera" }));
    expect(screen.queryByText("septiembre 2026")).not.toBeInTheDocument();
  });

  it("cierra el calendario con Escape y devuelve el foco al botón", () => {
    render(<DatePicker value="2026-09-05" onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "05/09/2026" });
    fireEvent.click(trigger);
    expect(screen.getByText("septiembre 2026")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByText("septiembre 2026").closest(".card")!, {
      key: "Escape",
    });
    expect(screen.queryByText("septiembre 2026")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("ArrowRight mueve el foco al día siguiente dentro de la grilla", () => {
    render(<DatePicker value="2026-09-05" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "05/09/2026" }));

    const dia5 = screen.getByRole("button", { name: "5 de septiembre de 2026" });
    dia5.focus();
    fireEvent.keyDown(dia5, { key: "ArrowRight" });

    expect(screen.getByRole("button", { name: "6 de septiembre de 2026" })).toHaveFocus();
  });
});
