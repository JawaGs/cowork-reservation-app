export const CANTIDAD_PUESTOS = 8;
export const MENSAJE_ERROR_DISPONIBILIDAD = "No se pudo cargar la disponibilidad de puestos";

export interface Puesto {
  id: string;
  libre: boolean;
}

export interface PuestosDisponibilidadResponse {
  puestos: Puesto[];
}

export interface PuestosDisponibilidadError {
  error: typeof MENSAJE_ERROR_DISPONIBILIDAD;
}

function hashString(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function calcularDisponibilidad(
  espacioId: string,
  fecha: string,
  horaInicio: string,
  horaFin: string,
): Puesto[] {
  const hash = hashString(`${espacioId}|${fecha}|${horaInicio}|${horaFin}`);
  return Array.from({ length: CANTIDAD_PUESTOS }, (_, i) => ({
    id: String(i + 1),
    libre: ((hash >> i) & 1) === 0,
  }));
}

export function debeFallar(fecha: string, intento: number): boolean {
  const dia = Number(fecha.split("-")[2]);
  return dia === 13 && intento === 1;
}

export function primerPuestoLibre(puestos: Puesto[]): string | null {
  const libre = puestos.find((p) => p.libre);
  return libre ? libre.id : null;
}

export type Direccion = 1 | -1;

export function siguientePuestoLibre(
  puestos: Puesto[],
  actualId: string,
  direccion: Direccion,
): string | null {
  const libres = puestos.filter((p) => p.libre).map((p) => p.id);
  const indice = libres.indexOf(actualId);
  if (indice === -1) return null;
  const siguiente = libres[indice + direccion];
  return siguiente ?? null;
}

export type EstadoAnuncioPuesto = "cargando" | "libre" | "ocupado" | "seleccionado";

const TEXTO_POR_ESTADO: Record<EstadoAnuncioPuesto, string> = {
  cargando: "cargando disponibilidad",
  libre: "libre",
  ocupado: "ocupado",
  seleccionado: "seleccionado",
};

export function anunciarPuesto(id: string, estado: EstadoAnuncioPuesto): string {
  return `Puesto ${id}, ${TEXTO_POR_ESTADO[estado]}`;
}
