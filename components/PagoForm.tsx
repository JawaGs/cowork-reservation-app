"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { validarPago, type DatosPago } from "@/lib/pago";
import { usePago } from "./PagoProvider";

interface PagoFormProps {
  hrefConfirmacion: string;
}

const CAMPOS: { name: keyof DatosPago; label: string; placeholder: string }[] = [
  { name: "numeroTarjeta", label: "Número de tarjeta", placeholder: "4111 1111 1111 1111" },
  { name: "nombreTitular", label: "Nombre del titular", placeholder: "Nombre Apellido" },
  { name: "expiracion", label: "Expiración (MM/YY)", placeholder: "09/26" },
  { name: "cvv", label: "CVV", placeholder: "123" },
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

  const resultado = validarPago(datos);

  function handleChange(campo: keyof DatosPago, valor: string) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIntentoEnviar(true);
    if (!resultado.valido) return;
    guardarPago(datos);
    router.push(hrefConfirmacion);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-fluid-sm">
      {CAMPOS.map(({ name, label, placeholder }) => (
        <label key={name} className="flex flex-col gap-fluid-2xs text-fluid-sm">
          {label}
          <input
            type="text"
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
      <button type="submit" className="btn-primary">
        Pagar
      </button>
    </form>
  );
}
