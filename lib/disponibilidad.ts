import type { Espacio, HorarioOcupado } from "./espacios";

export interface RangoReserva {
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
}

export interface ResultadoValidacion {
  valido: boolean;
  motivo?: "fecha-pasada" | "horario-ocupado" | "rango-invalido";
}

function minutosDesdeMedianoche(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function esFechaPasada(fecha: string, ahora: Date = new Date()): boolean {
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaReserva = new Date(anio, mes - 1, dia);
  return fechaReserva < hoy;
}

export function calcularDuracionHoras(horaInicio: string, horaFin: string): number {
  return (minutosDesdeMedianoche(horaFin) - minutosDesdeMedianoche(horaInicio)) / 60;
}

export function esDiaCompleto(duracionHoras: number): boolean {
  return duracionHoras > 6;
}

export function calcularPrecioUSD(espacio: Espacio, duracionHoras: number): number {
  return esDiaCompleto(duracionHoras)
    ? espacio.precioDiaUSD
    : espacio.precioHoraUSD * duracionHoras;
}

export function seSuperponeConOcupado(
  rango: RangoReserva,
  ocupados: HorarioOcupado[],
): boolean {
  const inicio = minutosDesdeMedianoche(rango.horaInicio);
  const fin = minutosDesdeMedianoche(rango.horaFin);

  return ocupados.some((ocupado) => {
    if (ocupado.fecha !== rango.fecha) return false;
    const ocupadoInicio = minutosDesdeMedianoche(ocupado.horaInicio);
    const ocupadoFin = minutosDesdeMedianoche(ocupado.horaFin);
    return inicio < ocupadoFin && ocupadoInicio < fin;
  });
}

export function validarReserva(
  espacio: Espacio,
  rango: RangoReserva,
  ahora: Date = new Date(),
): ResultadoValidacion {
  if (calcularDuracionHoras(rango.horaInicio, rango.horaFin) <= 0) {
    return { valido: false, motivo: "rango-invalido" };
  }
  if (esFechaPasada(rango.fecha, ahora)) {
    return { valido: false, motivo: "fecha-pasada" };
  }
  if (seSuperponeConOcupado(rango, espacio.horariosOcupados)) {
    return { valido: false, motivo: "horario-ocupado" };
  }
  return { valido: true };
}
