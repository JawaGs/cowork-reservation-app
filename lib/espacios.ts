export type TipoEspacio =
  | "escritorio-flexible"
  | "oficina-privada"
  | "sala-reuniones"
  | "espacio-eventos";

export const TIPO_LABELS: Record<TipoEspacio, string> = {
  "escritorio-flexible": "Escritorio flexible",
  "oficina-privada": "Oficina privada",
  "sala-reuniones": "Sala de reuniones",
  "espacio-eventos": "Espacio para eventos",
};

export interface HorarioOcupado {
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
}

export interface Espacio {
  id: string;
  nombre: string;
  ubicacion: string;
  precioHoraUSD: number;
  precioDiaUSD: number;
  tipo: TipoEspacio;
  horariosOcupados: HorarioOcupado[];
}

export const ESPACIOS_MOCK: Espacio[] = [
  { id: "1", nombre: "Providencia Hub", ubicacion: "Santiago", precioHoraUSD: 8, precioDiaUSD: 40, tipo: "escritorio-flexible", horariosOcupados: [{ fecha: "2026-09-01", horaInicio: "09:00", horaFin: "12:00" }] },
  { id: "2", nombre: "Las Condes Tower", ubicacion: "Santiago", precioHoraUSD: 25, precioDiaUSD: 120, tipo: "oficina-privada", horariosOcupados: [{ fecha: "2026-09-02", horaInicio: "14:00", horaFin: "18:00" }] },
  { id: "3", nombre: "Sala Andes", ubicacion: "Santiago", precioHoraUSD: 15, precioDiaUSD: 80, tipo: "sala-reuniones", horariosOcupados: [{ fecha: "2026-09-03", horaInicio: "10:00", horaFin: "11:00" }] },
  { id: "4", nombre: "Manhattan Desk", ubicacion: "Nueva York", precioHoraUSD: 18, precioDiaUSD: 90, tipo: "escritorio-flexible", horariosOcupados: [{ fecha: "2026-09-01", horaInicio: "08:00", horaFin: "10:00" }] },
  { id: "5", nombre: "Brooklyn Loft Office", ubicacion: "Nueva York", precioHoraUSD: 40, precioDiaUSD: 200, tipo: "oficina-privada", horariosOcupados: [{ fecha: "2026-09-04", horaInicio: "13:00", horaFin: "17:00" }] },
  { id: "6", nombre: "SoHo Event Space", ubicacion: "Nueva York", precioHoraUSD: 60, precioDiaUSD: 320, tipo: "espacio-eventos", horariosOcupados: [{ fecha: "2026-09-05", horaInicio: "18:00", horaFin: "22:00" }] },
  { id: "7", nombre: "Kreuzberg Desk", ubicacion: "Berlín", precioHoraUSD: 12, precioDiaUSD: 60, tipo: "escritorio-flexible", horariosOcupados: [{ fecha: "2026-09-02", horaInicio: "09:00", horaFin: "11:00" }] },
  { id: "8", nombre: "Mitte Office Suite", ubicacion: "Berlín", precioHoraUSD: 30, precioDiaUSD: 150, tipo: "oficina-privada", horariosOcupados: [{ fecha: "2026-09-03", horaInicio: "15:00", horaFin: "19:00" }] },
  { id: "9", nombre: "Sala Spree", ubicacion: "Berlín", precioHoraUSD: 20, precioDiaUSD: 100, tipo: "sala-reuniones", horariosOcupados: [{ fecha: "2026-09-04", horaInicio: "12:00", horaFin: "13:00" }] },
  { id: "10", nombre: "Gothic Quarter Desk", ubicacion: "Barcelona", precioHoraUSD: 10, precioDiaUSD: 50, tipo: "escritorio-flexible", horariosOcupados: [{ fecha: "2026-09-01", horaInicio: "14:00", horaFin: "16:00" }] },
  { id: "11", nombre: "Eixample Event Hall", ubicacion: "Barcelona", precioHoraUSD: 50, precioDiaUSD: 280, tipo: "espacio-eventos", horariosOcupados: [{ fecha: "2026-09-06", horaInicio: "10:00", horaFin: "14:00" }] },
  { id: "12", nombre: "Sala Gaudí", ubicacion: "Barcelona", precioHoraUSD: 16, precioDiaUSD: 85, tipo: "sala-reuniones", horariosOcupados: [{ fecha: "2026-09-02", horaInicio: "16:00", horaFin: "17:00" }] },
];

export interface EspacioFiltros {
  ubicacion?: string;
  tipo?: TipoEspacio;
  busqueda?: string;
}

export function filtrarEspacios(
  espacios: Espacio[],
  filtros: EspacioFiltros,
): Espacio[] {
  const busqueda = filtros.busqueda?.trim().toLowerCase();

  return espacios.filter((espacio) => {
    if (filtros.ubicacion && espacio.ubicacion !== filtros.ubicacion) {
      return false;
    }
    if (filtros.tipo && espacio.tipo !== filtros.tipo) {
      return false;
    }
    if (
      busqueda &&
      !espacio.nombre.toLowerCase().includes(busqueda) &&
      !espacio.ubicacion.toLowerCase().includes(busqueda)
    ) {
      return false;
    }
    return true;
  });
}
