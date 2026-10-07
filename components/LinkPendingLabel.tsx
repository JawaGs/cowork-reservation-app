"use client";

import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

interface LinkPendingLabelProps {
  children: ReactNode;
}

/** Debe usarse como hijo de un <Link>. Reserva el espacio del indicador
 * siempre (solo cambia su opacidad) para no generar layout shift. */
export function LinkPendingLabel({ children }: LinkPendingLabelProps) {
  const { pending } = useLinkStatus();
  return (
    <>
      {children}
      <span
        aria-hidden
        className={`ml-2 inline-block size-3 rounded-full border-2 border-current border-t-transparent align-[-2px] ${
          pending ? "animate-spin opacity-70" : "opacity-0"
        }`}
      />
    </>
  );
}
