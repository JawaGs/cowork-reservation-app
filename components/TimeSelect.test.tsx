import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimeSelect } from "./TimeSelect";

describe("TimeSelect", () => {
  it("lista horas desde las 07:00 hasta las 22:00 cada 30 minutos", () => {
    render(<TimeSelect label="Hora inicio" value="" onChange={vi.fn()} />);
    const opciones = screen.getAllByRole("option").map((o) => o.textContent);
    expect(opciones).toContain("07:00");
    expect(opciones).toContain("22:00");
    expect(opciones).not.toContain("06:30");
    expect(opciones).not.toContain("22:30");
  });

  it("filtra las horas que no son estrictamente posteriores a min", () => {
    render(<TimeSelect label="Hora fin" value="" onChange={vi.fn()} min="10:00" />);
    const opciones = screen.getAllByRole("option").map((o) => o.textContent);
    expect(opciones).not.toContain("10:00");
    expect(opciones).not.toContain("09:30");
    expect(opciones).toContain("10:30");
  });

  it("llama a onChange con la hora seleccionada", () => {
    const onChange = vi.fn();
    render(<TimeSelect label="Hora inicio" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Hora inicio"), { target: { value: "09:00" } });
    expect(onChange).toHaveBeenCalledWith("09:00");
  });
});
