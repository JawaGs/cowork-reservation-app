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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      {CAMPOS.map(({ name, label, placeholder }) => (
        <label key={name} className="flex flex-col gap-1">
          {label}
          <input
            type="text"
            value={datos[name]}
            placeholder={placeholder}
            onChange={(e) => handleChange(name, e.target.value)}
            className="border px-2 py-1"
          />
          {intentoEnviar && resultado.errores[name] && (
            <span className="text-red-600 text-sm">{resultado.errores[name]}</span>
          )}
        </label>
      ))}
      <button type="submit" className="border rounded px-4 py-2 bg-black text-white">
        Pagar
      </button>
    </form>
  );
}
