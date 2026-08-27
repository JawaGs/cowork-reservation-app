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

export interface Espacio {
  id: string;
  nombre: string;
  ubicacion: string;
  precioHoraUSD: number;
  tipo: TipoEspacio;
}

export const ESPACIOS_MOCK: Espacio[] = [
  { id: "1", nombre: "Providencia Hub", ubicacion: "Santiago", precioHoraUSD: 8, tipo: "escritorio-flexible" },
  { id: "2", nombre: "Las Condes Tower", ubicacion: "Santiago", precioHoraUSD: 25, tipo: "oficina-privada" },
  { id: "3", nombre: "Sala Andes", ubicacion: "Santiago", precioHoraUSD: 15, tipo: "sala-reuniones" },
  { id: "4", nombre: "Manhattan Desk", ubicacion: "Nueva York", precioHoraUSD: 18, tipo: "escritorio-flexible" },
  { id: "5", nombre: "Brooklyn Loft Office", ubicacion: "Nueva York", precioHoraUSD: 40, tipo: "oficina-privada" },
  { id: "6", nombre: "SoHo Event Space", ubicacion: "Nueva York", precioHoraUSD: 60, tipo: "espacio-eventos" },
  { id: "7", nombre: "Kreuzberg Desk", ubicacion: "Berlín", precioHoraUSD: 12, tipo: "escritorio-flexible" },
  { id: "8", nombre: "Mitte Office Suite", ubicacion: "Berlín", precioHoraUSD: 30, tipo: "oficina-privada" },
  { id: "9", nombre: "Sala Spree", ubicacion: "Berlín", precioHoraUSD: 20, tipo: "sala-reuniones" },
  { id: "10", nombre: "Gothic Quarter Desk", ubicacion: "Barcelona", precioHoraUSD: 10, tipo: "escritorio-flexible" },
  { id: "11", nombre: "Eixample Event Hall", ubicacion: "Barcelona", precioHoraUSD: 50, tipo: "espacio-eventos" },
  { id: "12", nombre: "Sala Gaudí", ubicacion: "Barcelona", precioHoraUSD: 16, tipo: "sala-reuniones" },
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
