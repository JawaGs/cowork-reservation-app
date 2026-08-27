export interface DatosPago {
  numeroTarjeta: string;
  nombreTitular: string;
  expiracion: string; // MM/YY
  cvv: string;
}

export type CampoPago = keyof DatosPago;
export interface ResultadoValidacionPago {
  valido: boolean;
  errores: Partial<Record<CampoPago, string>>;
}

function expiracionVencida(expiracion: string, ahora: Date): boolean {
  const [mesStr, anioStr] = expiracion.split("/");
  const mes = Number(mesStr);
  const anio = Number(anioStr) + 2000;
  const finDeMes = new Date(anio, mes, 0, 23, 59, 59);
  return finDeMes < ahora;
}

export function validarPago(
  datos: DatosPago,
  ahora: Date = new Date(),
): ResultadoValidacionPago {
  const errores: Partial<Record<CampoPago, string>> = {};

  const numeroLimpio = datos.numeroTarjeta.replace(/\s/g, "");
  if (!/^\d{16}$/.test(numeroLimpio)) {
    errores.numeroTarjeta = "El número de tarjeta debe tener 16 dígitos.";
  }

  if (!datos.nombreTitular.trim()) {
    errores.nombreTitular = "El nombre del titular es obligatorio.";
  }

  if (!/^\d{2}\/\d{2}$/.test(datos.expiracion)) {
    errores.expiracion = "La expiración debe tener el formato MM/YY.";
  } else {
    const mes = Number(datos.expiracion.split("/")[0]);
    if (mes < 1 || mes > 12) {
      errores.expiracion = "El mes de expiración no es válido.";
    } else if (expiracionVencida(datos.expiracion, ahora)) {
      errores.expiracion = "La tarjeta está vencida.";
    }
  }

  if (!/^\d{3}$/.test(datos.cvv)) {
    errores.cvv = "El CVV debe tener 3 dígitos.";
  }

  return { valido: Object.keys(errores).length === 0, errores };
}
