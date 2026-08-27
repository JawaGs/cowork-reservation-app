"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DatosPago } from "@/lib/pago";

export interface PagoContextValue {
  datosPago: DatosPago | null;
  guardarPago: (datos: DatosPago) => void;
}

const PagoContext = createContext<PagoContextValue | null>(null);

export function PagoProvider({ children }: { children: ReactNode }) {
  const [datosPago, setDatosPago] = useState<DatosPago | null>(null);

  return (
    <PagoContext.Provider value={{ datosPago, guardarPago: setDatosPago }}>
      {children}
    </PagoContext.Provider>
  );
}

export function usePago(): PagoContextValue {
  const context = useContext(PagoContext);
  if (!context) {
    throw new Error("usePago debe usarse dentro de un PagoProvider");
  }
  return context;
}
