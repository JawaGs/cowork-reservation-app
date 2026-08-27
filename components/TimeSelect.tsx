interface TimeSelectProps {
  label: string;
  value: string;
  onChange: (hora: string) => void;
  min?: string;
}

const INICIO_MINUTOS = 7 * 60; // 07:00
const FIN_MINUTOS = 22 * 60; // 22:00
const PASO_MINUTOS = 30;

function generarHoras(): string[] {
  const horas: string[] = [];
  for (let minutos = INICIO_MINUTOS; minutos <= FIN_MINUTOS; minutos += PASO_MINUTOS) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0");
    const m = String(minutos % 60).padStart(2, "0");
    horas.push(`${h}:${m}`);
  }
  return horas;
}

const TODAS_LAS_HORAS = generarHoras();

export function TimeSelect({ label, value, onChange, min }: TimeSelectProps) {
  const opciones = min ? TODAS_LAS_HORAS.filter((hora) => hora > min) : TODAS_LAS_HORAS;

  return (
    <label className="flex flex-col gap-1">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border px-2 py-1"
      >
        <option value="" disabled>
          Selecciona una hora
        </option>
        {opciones.map((hora) => (
          <option key={hora} value={hora}>
            {hora}
          </option>
        ))}
      </select>
    </label>
  );
}
