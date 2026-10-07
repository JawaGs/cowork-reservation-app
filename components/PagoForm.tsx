"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { validarPago, type DatosPago } from "@/lib/pago";
import { usePago } from "./PagoProvider";

interface PagoFormProps {
  hrefConfirmacion: string;
}

const CAMPOS: {
  name: keyof DatosPago;
  label: string;
  placeholder: string;
  type: "text" | "password";
}[] = [
  {
    name: "numeroTarjeta",
    label: "Número de tarjeta",
    placeholder: "4111 1111 1111 1111",
    type: "text",
  },
  { name: "nombreTitular", label: "Nombre del titular", placeholder: "Nombre Apellido", type: "text" },
  { name: "expiracion", label: "Expiración (MM/YY)", placeholder: "09/26", type: "text" },
  { name: "cvv", label: "CVV", placeholder: "123", type: "password" },
];

const DATOS_INICIALES: DatosPago = {
  numeroTarjeta: "",
  nombreTitular: "",
  expiracion: "",
  cvv: "",
};

export function PagoForm({ hrefConfirmacion }: PagoFormProps) {
  const router = useRouter();
  const { guardarPago } = usePago();
  const [datos, setDatos] = useState<DatosPago>(DATOS_INICIALES);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [isPending, startTransition] = useTransition();

  const resultado = validarPago(datos);

  function handleChange(campo: keyof DatosPago, valor: string) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIntentoEnviar(true);
    if (!resultado.valido) return;
    guardarPago(datos);
    startTransition(() => {
      router.push(hrefConfirmacion);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-fluid-sm">
      {CAMPOS.map(({ name, label, placeholder, type }) => (
        <label key={name} className="flex flex-col gap-fluid-2xs text-fluid-sm">
          {label}
          <input
            type={type}
            value={datos[name]}
            placeholder={placeholder}
            onChange={(e) => handleChange(name, e.target.value)}
            className="field"
          />
          {intentoEnviar && resultado.errores[name] && (
            <span className="text-fluid-xs text-red-600 dark:text-red-400">
              {resultado.errores[name]}
            </span>
          )}
        </label>
      ))}
      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
        {isPending ? "Pagando…" : "Pagar"}
      </button>
    </form>
  );
}
