import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RangoReserva } from "@/lib/disponibilidad";
import { MENSAJE_ERROR_DISPONIBILIDAD } from "@/lib/puestos";
import { PlanoPuestos } from "./PlanoPuestos";

const RANGO: RangoReserva = { fecha: "2026-09-05", horaInicio: "10:00", horaFin: "12:00" };

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

interface MontarOverrides {
  rango?: RangoReserva | null;
  puestoIdSeleccionado?: string | null;
  onSeleccionar?: (id: string | null) => void;
}

function construirProps(overrides: MontarOverrides) {
  return {
    espacioId: "1",
    rango: overrides.rango === undefined ? RANGO : overrides.rango,
    puestoIdSeleccionado: overrides.puestoIdSeleccionado ?? null,
    onSeleccionar: overrides.onSeleccionar ?? (() => {}),
  };
}

function renderPlano(overrides: MontarOverrides = {}) {
  const props = construirProps(overrides);
  const utils = render(<PlanoPuestos {...props} />);
  return {
    ...utils,
    rerenderCon(nuevos: MontarOverrides) {
      utils.rerender(<PlanoPuestos {...construirProps({ ...overrides, ...nuevos })} />);
    },
  };
}

const PUESTOS_ALTERNADOS = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  libre: i % 2 === 0,
}));

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

  it("AC-05: seleccionar un puesto libre lo marca y llama a onSeleccionar con su id", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    const onSeleccionar = vi.fn();
    const { rerenderCon } = renderPlano({ onSeleccionar });
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button", { name: /puesto 1, libre/i }));
    expect(onSeleccionar).toHaveBeenCalledWith("1");

    rerenderCon({ onSeleccionar, puestoIdSeleccionado: "1" });
    expect(screen.getByRole("button", { name: /puesto 1, seleccionado/i })).toHaveTextContent("✓");
  });

  it("AC-06: elegir otro puesto libre reemplaza la selección anterior", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    const onSeleccionar = vi.fn();
    const { rerenderCon } = renderPlano({ onSeleccionar, puestoIdSeleccionado: "1" });
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button", { name: /puesto 3, libre/i }));
    expect(onSeleccionar).toHaveBeenCalledWith("3");

    rerenderCon({ onSeleccionar, puestoIdSeleccionado: "3" });
    expect(screen.getByRole("button", { name: /puesto 1, libre/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /puesto 3, seleccionado/i })).toHaveTextContent("✓");
  });

  it("AC-07: hacer clic en un puesto ocupado no hace nada", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    const onSeleccionar = vi.fn();
    renderPlano({ onSeleccionar });
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button", { name: /puesto 2, ocupado/i }));
    expect(onSeleccionar).not.toHaveBeenCalled();
  });

  it("AC-19: hacer clic en el puesto ya seleccionado no llama a onSeleccionar", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    const onSeleccionar = vi.fn();
    renderPlano({ onSeleccionar, puestoIdSeleccionado: "1" });
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button", { name: /puesto 1, seleccionado/i }));
    expect(onSeleccionar).not.toHaveBeenCalled();
  });

  it("AC-11: las flechas mueven el foco entre los puestos libres en orden de id", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    renderPlano();
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    screen.getByRole("button", { name: /puesto 1, libre/i }).focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /puesto 3, libre/i }));

    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /puesto 5, libre/i }));

    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /puesto 3, libre/i }));
  });

  it("AC-11: Enter sobre un puesto libre con foco lo selecciona", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    const onSeleccionar = vi.fn();
    renderPlano({ onSeleccionar });
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    screen.getByRole("button", { name: /puesto 1, libre/i }).focus();
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    expect(onSeleccionar).toHaveBeenCalledWith("1");
  });

  it("AC-12: el aria-label de cada puesto refleja su estado", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    renderPlano({ puestoIdSeleccionado: "1" });
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    expect(screen.getByRole("button", { name: "Puesto 1, seleccionado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Puesto 3, libre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Puesto 2, ocupado" })).toBeInTheDocument();
  });

  it("AC-24: ningún puesto tiene tabIndex 0 cuando no hay ninguno libre", async () => {
    const puestos = Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), libre: false }));
    fetchMock.mockResolvedValue(jsonResponse({ puestos }));
    renderPlano();
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    screen.getAllByRole("button").forEach((boton) => expect(boton).toHaveAttribute("tabindex", "-1"));
  });

  it("AC-18: preselecciona el puesto si puestoIdSeleccionado corresponde a uno libre", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    const onSeleccionar = vi.fn();
    renderPlano({ onSeleccionar, puestoIdSeleccionado: "1" });
    await waitFor(() => expect(screen.getAllByRole("button")[0]).not.toBeDisabled());

    expect(screen.getByRole("button", { name: /puesto 1, seleccionado/i })).toHaveTextContent("✓");
    expect(onSeleccionar).not.toHaveBeenCalled();
  });

  it("AC-18: llama a onSeleccionar(null) si puestoIdSeleccionado no corresponde a ningún puesto libre", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ puestos: PUESTOS_ALTERNADOS }));
    const onSeleccionar = vi.fn();
    renderPlano({ onSeleccionar, puestoIdSeleccionado: "2" }); // "2" está ocupado
    await waitFor(() => expect(onSeleccionar).toHaveBeenCalledWith(null));
  });

  it("AC-18: no llama a onSeleccionar si la petición de montaje falla", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const onSeleccionar = vi.fn();
    renderPlano({ onSeleccionar, puestoIdSeleccionado: "1" });
    await screen.findByRole("button", { name: "Reintentar" });

    expect(onSeleccionar).not.toHaveBeenCalled();
  });
});
