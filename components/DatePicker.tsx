"use client";

import { useEffect, useRef, useState } from "react";

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

function toISO({ year, month, day }: FechaPartes): string {
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

function formatCompleta(partes: FechaPartes): string {
  return `${partes.day} de ${MESES[partes.month]} de ${partes.year}`;
}

function hoyPartes(): FechaPartes {
  const hoy = new Date();
  return { year: hoy.getFullYear(), month: hoy.getMonth(), day: hoy.getDate() };
}

function sumarDias(partes: FechaPartes, delta: number): FechaPartes {
  const fecha = new Date(partes.year, partes.month, partes.day + delta);
  return { year: fecha.getFullYear(), month: fecha.getMonth(), day: fecha.getDate() };
}

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function DatePicker({ value, onChange, minDate }: DatePickerProps) {
  const seleccionado = parseISO(value);
  const minimo = minDate ? parseISO(minDate) : null;
  const inicial = seleccionado ?? minimo ?? hoyPartes();

  const [open, setOpen] = useState(false);
  // "cursor" cumple doble función: qué mes se muestra (cursor.year/month) y
  // qué día tiene el foco de teclado dentro de ese mes (roving tabindex).
  const [cursor, setCursor] = useState<FechaPartes>(inicial);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const diaRefs = useRef(new Map<number, HTMLButtonElement>());

  const primerDiaSemana = new Date(cursor.year, cursor.month, 1).getDay();
  const diasEnMes = new Date(cursor.year, cursor.month + 1, 0).getDate();

  function esAntesDeMinimo(partes: FechaPartes): boolean {
    if (!minimo) return false;
    return (
      new Date(partes.year, partes.month, partes.day) <
      new Date(minimo.year, minimo.month, minimo.day)
    );
  }

  function seleccionarDia(day: number) {
    const partes = { year: cursor.year, month: cursor.month, day };
    onChange(toISO(partes));
    setOpen(false);
    triggerRef.current?.focus();
  }

  function cambiarMes(delta: number) {
    setCursor(({ year, month, day }) => {
      const fecha = new Date(year, month + delta, 1);
      const diasDelNuevoMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
      return { year: fecha.getFullYear(), month: fecha.getMonth(), day: Math.min(day, diasDelNuevoMes) };
    });
  }

  function moverCursor(delta: number) {
    setCursor((actual) => sumarDias(actual, delta));
  }

  // Solo flechas: Enter/Espacio para seleccionar ya los maneja el navegador
  // de forma nativa (el día con foco es un <button> real).
  function handleGridKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moverCursor(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moverCursor(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        moverCursor(7);
        break;
      case "ArrowUp":
        e.preventDefault();
        moverCursor(-7);
        break;
    }
  }

  function handlePopoverKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  // Cierra al hacer clic fuera del date picker.
  useEffect(() => {
    if (!open) return;
    function handleClickFuera(e: MouseEvent) {
      if (!contenedorRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [open]);

  // Mueve el foco del teclado al día "cursor" cada vez que cambia.
  useEffect(() => {
    if (open) diaRefs.current.get(cursor.day)?.focus();
  }, [open, cursor]);

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => {
          setCursor(seleccionado ?? minimo ?? hoyPartes());
          setOpen((o) => !o);
        }}
        className={`field text-left ${FOCUS_RING}`}
      >
        {value ? formatDisplay(value) : "Selecciona una fecha"}
      </button>

      {open && (
        <div
          className="card absolute z-10 mt-fluid-2xs w-64 bg-background shadow-sm"
          onKeyDown={handlePopoverKeyDown}
        >
          <div className="flex items-center justify-between mb-fluid-xs text-fluid-sm">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              aria-label="Mes anterior"
              className={`px-1 text-muted hover:text-foreground ${FOCUS_RING}`}
            >
              ‹
            </button>
            <span className="font-medium">
              {MESES[cursor.month]} {cursor.year}
            </span>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              aria-label="Mes siguiente"
              className={`px-1 text-muted hover:text-foreground ${FOCUS_RING}`}
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-fluid-xs text-muted mb-fluid-2xs">
            {DIAS_SEMANA.map((dia) => (
              <span key={dia}>{dia}</span>
            ))}
          </div>
          <div
            role="grid"
            onKeyDown={handleGridKeyDown}
            className="grid grid-cols-7 gap-1 text-center text-fluid-sm"
          >
            {Array.from({ length: primerDiaSemana }).map((_, i) => (
              <span key={`vacio-${i}`} />
            ))}
            {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((day) => {
              const partesDelDia = { year: cursor.year, month: cursor.month, day };
              const deshabilitado = esAntesDeMinimo(partesDelDia);
              const esSeleccionado =
                seleccionado?.year === cursor.year &&
                seleccionado?.month === cursor.month &&
                seleccionado?.day === day;
              const esCursor = cursor.day === day;

              return (
                <button
                  key={day}
                  ref={(el) => {
                    if (el) diaRefs.current.set(day, el);
                    else diaRefs.current.delete(day);
                  }}
                  type="button"
                  disabled={deshabilitado}
                  tabIndex={esCursor ? 0 : -1}
                  aria-label={formatCompleta(partesDelDia)}
                  aria-current={esSeleccionado ? "date" : undefined}
                  onClick={() => seleccionarDia(day)}
                  onFocus={() => setCursor(partesDelDia)}
                  className={`${FOCUS_RING} ${
                    esSeleccionado
                      ? "rounded bg-accent py-1 text-accent-foreground"
                      : deshabilitado
                        ? "py-1 text-border"
                        : "rounded py-1 hover:bg-border/40"
                  }`}
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
