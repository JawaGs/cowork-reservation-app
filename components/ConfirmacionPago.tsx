"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePago } from "./PagoProvider";

interface ConfirmacionPagoProps {
  hrefPago: string;
}

export function ConfirmacionPago({ hrefPago }: ConfirmacionPagoProps) {
  const router = useRouter();
  const { datosPago } = usePago();

  useEffect(() => {
    if (!datosPago) {
      router.replace(hrefPago);
    }
  }, [datosPago, hrefPago, router]);

  if (!datosPago) {
    return <p className="text-zinc-600">Redirigiendo a pago…</p>;
  }

  return (
    <p className="text-zinc-600">
      Pago confirmado con tarjeta terminada en {datosPago.numeroTarjeta.slice(-4)}.
    </p>
  );
}
