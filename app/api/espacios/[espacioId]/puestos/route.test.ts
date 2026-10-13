import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MENSAJE_ERROR_DISPONIBILIDAD } from "@/lib/puestos";
import { GET } from "./route";

function buildRequest(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost/api/espacios/1/puestos");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new NextRequest(url);
}

function buildCtx(espacioId: string) {
  return { params: Promise.resolve({ espacioId }) };
}

describe("GET /api/espacios/[espacioId]/puestos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("AC-09: responde 500 con el mensaje fijo en el primer intento de una fecha día 13", async () => {
    const promise = GET(
      buildRequest({ fecha: "2026-09-13", horaInicio: "10:00", horaFin: "12:00", intento: "1" }),
      buildCtx("1"),
    );
    await vi.advanceTimersByTimeAsync(600);
    const response = await promise;
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: MENSAJE_ERROR_DISPONIBILIDAD });
  });

  it("AC-09: responde 200 en el segundo intento de la misma fecha día 13", async () => {
    const promise = GET(
      buildRequest({ fecha: "2026-09-13", horaInicio: "10:00", horaFin: "12:00", intento: "2" }),
      buildCtx("1"),
    );
    await vi.advanceTimersByTimeAsync(600);
    const response = await promise;
    expect(response.status).toBe(200);
  });

  it("AC-22: responde 200 para una fecha que no es día 13", async () => {
    const promise = GET(
      buildRequest({ fecha: "2026-09-05", horaInicio: "10:00", horaFin: "12:00", intento: "1" }),
      buildCtx("1"),
    );
    await vi.advanceTimersByTimeAsync(600);
    const response = await promise;
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.puestos).toHaveLength(8);
  });

  it("espera ~600ms de latencia antes de responder", async () => {
    const promise = GET(
      buildRequest({ fecha: "2026-09-05", horaInicio: "10:00", horaFin: "12:00", intento: "1" }),
      buildCtx("1"),
    );
    let resuelto = false;
    promise.then(() => {
      resuelto = true;
    });
    await vi.advanceTimersByTimeAsync(500);
    expect(resuelto).toBe(false);
    await vi.advanceTimersByTimeAsync(150);
    expect(resuelto).toBe(true);
  });
});
