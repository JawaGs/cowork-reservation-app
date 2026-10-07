"use client";

import { useState } from "react";

interface DatePickerProps {
  value: string;
  onChange: (fecha: string) => void;
  minDate?: string;
}

const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

interface FechaPartes {
  year: number;
  month: number; // 0-indexado
  day: number;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toISO({ year, month, day }: { year: number; month: number; day: number }): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseISO(iso: string): FechaPartes | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

function formatDisplay(iso: string): string {
  const parsed = parseISO(iso);
  if (!parsed) return "";
  return `${pad(parsed.day)}/${pad(parsed.month + 1)}/${parsed.year}`;
}

function hoyPartes(): FechaPartes {
  const hoy = new Date();
  return { year: hoy.getFullYear(), month: hoy.getMonth(), day: hoy.getDate() };
}

export function DatePicker({ value, onChange, minDate }: DatePickerProps) {
  const seleccionado = parseISO(value);
  const minimo = minDate ? parseISO(minDate) : null;
  const inicial = seleccionado ?? minimo ?? hoyPartes();

  const [open, setOpen] = useState(false);
  const [mesVisible, setMesVisible] = useState({ year: inicial.year, month: inicial.month });

  const primerDiaSemana = new Date(mesVisible.year, mesVisible.month, 1).getDay();
  const diasEnMes = new Date(mesVisible.year, mesVisible.month + 1, 0).getDate();

  function esAntesDeMinimo(day: number): boolean {
    if (!minimo) return false;
    const fecha = new Date(mesVisible.year, mesVisible.month, day);
    const min = new Date(minimo.year, minimo.month, minimo.day);
    return fecha < min;
  }

  function seleccionarDia(day: number) {
    onChange(toISO({ year: mesVisible.year, month: mesVisible.month, day }));
    setOpen(false);
  }

  function cambiarMes(delta: number) {
    setMesVisible(({ year, month }) => {
      const fecha = new Date(year, month + delta, 1);
      return { year: fecha.getFullYear(), month: fecha.getMonth() };
    });
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="field text-left">
        {value ? formatDisplay(value) : "Selecciona una fecha"}
      </button>

      {open && (
        <div className="card absolute z-10 mt-fluid-2xs w-64 bg-background shadow-sm">
          <div className="flex items-center justify-between mb-fluid-xs text-fluid-sm">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              aria-label="Mes anterior"
              className="px-1 text-muted hover:text-foreground"
            >
              ‹
            </button>
            <span className="font-medium">
              {MESES[mesVisible.month]} {mesVisible.year}
            </span>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              aria-label="Mes siguiente"
              className="px-1 text-muted hover:text-foreground"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-fluid-xs text-muted mb-fluid-2xs">
            {DIAS_SEMANA.map((dia) => (
              <span key={dia}>{dia}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-fluid-sm">
            {Array.from({ length: primerDiaSemana }).map((_, i) => (
              <span key={`vacio-${i}`} />
            ))}
            {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((day) => {
              const deshabilitado = esAntesDeMinimo(day);
              const esSeleccionado =
                seleccionado?.year === mesVisible.year &&
                seleccionado?.month === mesVisible.month &&
                seleccionado?.day === day;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => seleccionarDia(day)}
                  className={
                    esSeleccionado
                      ? "rounded bg-accent py-1 text-accent-foreground"
                      : deshabilitado
                        ? "py-1 text-border"
                        : "rounded py-1 hover:bg-border/40"
                  }
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
