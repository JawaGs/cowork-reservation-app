import type { NextRequest } from "next/server";
import { calcularDisponibilidad, debeFallar, MENSAJE_ERROR_DISPONIBILIDAD } from "@/lib/puestos";

const LATENCIA_MS = 600;

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/espacios/[espacioId]/puestos">,
): Promise<Response> {
  const { espacioId } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const fecha = params.get("fecha") ?? "";
  const horaInicio = params.get("horaInicio") ?? "";
  const horaFin = params.get("horaFin") ?? "";
  const intento = Number(params.get("intento") ?? "1");

  await new Promise((resolve) => setTimeout(resolve, LATENCIA_MS));

  if (debeFallar(fecha, intento)) {
    return Response.json({ error: MENSAJE_ERROR_DISPONIBILIDAD }, { status: 500 });
  }

  return Response.json({
    puestos: calcularDisponibilidad(espacioId, fecha, horaInicio, horaFin),
  });
}
