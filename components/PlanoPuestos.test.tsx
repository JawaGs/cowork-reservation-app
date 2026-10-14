import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RangoReserva } from "@/lib/disponibilidad";
import { PlanoPuestos } from "./PlanoPuestos";

const RANGO: RangoReserva = { fecha: "2026-09-05", horaInicio: "10:00", horaFin: "12:00" };

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

function renderPlano(rango: RangoReserva | null = RANGO) {
  return render(
    <PlanoPuestos espacioId="1" rango={rango} puestoIdSeleccionado={null} onSeleccionar={() => {}} />,
  );
}

describe("PlanoPuestos", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-03: muestra los 8 puestos deshabilitados mientras carga la disponibilidad", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    renderPlano();
    const botones = screen.getAllByRole("button");
    expect(botones).toHaveLength(8);
    botones.forEach((boton) => expect(boton).toBeDisabled());
  });

  it("AC-04: cada puesto muestra libre u ocupado según la respuesta", async () => {
    const puestos = Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), libre: i % 2 === 0 }));
    fetchMock.mockResolvedValue(jsonResponse({ puestos }));
    renderPlano();

    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    const libre = screen.getByRole("button", { name: /puesto 1, libre/i });
    const ocupado = screen.getByRole("button", { name: /puesto 2, ocupado/i });
    expect(libre).toBeInTheDocument();
    expect(ocupado).toHaveTextContent("✕");
  });

  it("AC-08: muestra el mensaje 'No hay puestos disponibles para este horario' cuando los 8 están ocupados", async () => {
    const puestos = Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), libre: false }));
    fetchMock.mockResolvedValue(jsonResponse({ puestos }));
    renderPlano();

    expect(
      await screen.findByText("No hay puestos disponibles para este horario"),
    ).toBeInTheDocument();
  });
});
