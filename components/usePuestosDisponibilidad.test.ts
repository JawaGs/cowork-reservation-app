import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RangoReserva } from "@/lib/disponibilidad";
import { usePuestosDisponibilidad } from "./usePuestosDisponibilidad";

interface Deferred {
  promise: Promise<Response>;
  resolve: (response: Response) => void;
}

function deferred(): Deferred {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

const RANGO_A: RangoReserva = { fecha: "2026-09-05", horaInicio: "10:00", horaFin: "12:00" };
const RANGO_B: RangoReserva = { fecha: "2026-09-06", horaInicio: "09:00", horaFin: "11:00" };

describe("usePuestosDisponibilidad", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-03: el estado es 'cargando' mientras la petición está pendiente", async () => {
    fetchMock.mockReturnValue(deferred().promise);
    const { result } = renderHook(() => usePuestosDisponibilidad("1", RANGO_A));
    await waitFor(() => expect(result.current.estado).toBe("cargando"));
  });

  it("no dispara ninguna petición cuando el rango es null", () => {
    const { result } = renderHook(() => usePuestosDisponibilidad("1", null));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.estado).toBe("inactivo");
  });

  it("AC-22: el estado pasa a 'error' si el fetch rechaza por un problema de red", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => usePuestosDisponibilidad("1", RANGO_A));
    await waitFor(() => expect(result.current.estado).toBe("error"));
  });

  it("AC-14: descarta la respuesta de una petición obsoleta", async () => {
    const primera = deferred();
    const segunda = deferred();
    fetchMock.mockReturnValueOnce(primera.promise).mockReturnValueOnce(segunda.promise);

    const { result, rerender } = renderHook(
      ({ rango }: { rango: RangoReserva | null }) => usePuestosDisponibilidad("1", rango),
      { initialProps: { rango: RANGO_A as RangoReserva | null } },
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    rerender({ rango: RANGO_B });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const puestosB = [{ id: "1", libre: true }];
    const puestosA = [{ id: "1", libre: false }];

    await act(async () => {
      segunda.resolve(jsonResponse({ puestos: puestosB }));
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.estado).toBe("exito"));

    await act(async () => {
      primera.resolve(jsonResponse({ puestos: puestosA }));
      await Promise.resolve();
    });

    expect(result.current.puestos).toEqual(puestosB);
  });

  it("AC-20: vuelve a 'cargando' y reinicia el intento al cambiar de rango", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ puestos: [] }));
    const { result, rerender } = renderHook(
      ({ rango }: { rango: RangoReserva | null }) => usePuestosDisponibilidad("1", rango),
      { initialProps: { rango: RANGO_A as RangoReserva | null } },
    );
    await waitFor(() => expect(result.current.estado).toBe("exito"));

    fetchMock.mockResolvedValueOnce(jsonResponse({ puestos: [] }));
    rerender({ rango: RANGO_B });
    expect(result.current.estado).toBe("cargando");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const segundaUrl = fetchMock.mock.calls[1][0] as string;
    expect(segundaUrl).toContain("intento=1");
  });

  it("AC-10: reintentar repite el mismo rango con intento incrementado", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(() => usePuestosDisponibilidad("1", RANGO_A));
    await waitFor(() => expect(result.current.estado).toBe("error"));

    fetchMock.mockResolvedValueOnce(jsonResponse({ puestos: [] }));
    act(() => {
      result.current.reintentar();
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const segundaUrl = fetchMock.mock.calls[1][0] as string;
    expect(segundaUrl).toContain(RANGO_A.fecha);
    expect(segundaUrl).toContain("intento=2");
  });
});
