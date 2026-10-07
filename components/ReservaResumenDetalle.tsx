import { TIPO_LABELS, type Espacio } from "@/lib/espacios";
import { esDiaCompleto } from "@/lib/disponibilidad";
import { formatDate, type Market } from "@/lib/market";
import { formatPrice } from "@/lib/pricing";

interface ReservaResumenDetalleProps {
  espacio: Espacio;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracion: number;
  precioUSD: number;
  market: Market;
}

export function ReservaResumenDetalle({
  espacio,
  fecha,
  horaInicio,
  horaFin,
  duracion,
  precioUSD,
  market,
}: ReservaResumenDetalleProps) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-fluid-sm gap-y-fluid-2xs text-fluid-base">
      <dt className="text-muted">Espacio</dt>
      <dd>{espacio.nombre}</dd>
      <dt className="text-muted">Ubicación</dt>
      <dd>{espacio.ubicacion}</dd>
      <dt className="text-muted">Tipo</dt>
      <dd>{TIPO_LABELS[espacio.tipo]}</dd>
      <dt className="text-muted">Fecha</dt>
      <dd>{formatDate(fecha, market)}</dd>
      <dt className="text-muted">Horario</dt>
      <dd>
        {horaInicio} – {horaFin}
      </dd>
      <dt className="text-muted">Duración</dt>
      <dd>
        {duracion}h{esDiaCompleto(duracion) ? " (tarifa día completo)" : ""}
      </dd>
      <dt className="text-muted">Precio total</dt>
      <dd className="font-medium">{formatPrice(precioUSD, market)}</dd>
    </dl>
  );
}
