import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RangoReserva } from "@/lib/disponibilidad";
import { MENSAJE_ERROR_DISPONIBILIDAD } from "@/lib/puestos";
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

  it("AC-10: muestra el mensaje de error y el botón Reintentar cuando falla la petición", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    renderPlano();

    expect(await screen.findByText(MENSAJE_ERROR_DISPONIBILIDAD)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Plano de puestos" })).not.toBeInTheDocument();
  });

  it("AC-10: reintentar vuelve a mostrar el estado de carga y luego el resultado", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network"));
    renderPlano();
    await screen.findByRole("button", { name: "Reintentar" });

    const puestos = Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), libre: true }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ puestos }));
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(screen.getAllByRole("button")).toHaveLength(8);
    screen.getAllByRole("button").forEach((boton) => expect(boton).toBeDisabled());

    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());
  });

  it('AC-25: el contenedor del mensaje de error tiene role="status"', async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    renderPlano();

    const mensaje = await screen.findByText(MENSAJE_ERROR_DISPONIBILIDAD);
    expect(mensaje).toHaveAttribute("role", "status");
  });

  it('AC-25: el contenedor del mensaje de \'sin puestos\' tiene role="status"', async () => {
    const puestos = Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), libre: false }));
    fetchMock.mockResolvedValue(jsonResponse({ puestos }));
    renderPlano();

    const mensaje = await screen.findByText("No hay puestos disponibles para este horario");
    expect(mensaje).toHaveAttribute("role", "status");
  });
});
