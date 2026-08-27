import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmacionPago } from "./ConfirmacionPago";
import { PagoProvider, usePago } from "./PagoProvider";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

beforeEach(() => {
  replace.mockClear();
});

function Iniciar() {
  const { guardarPago } = usePago();
  useEffect(() => {
    guardarPago({
      numeroTarjeta: "4111111111111111",
      nombreTitular: "Jose Valor",
      expiracion: "09/30",
      cvv: "123",
    });
  }, [guardarPago]);
  return null;
}

describe("ConfirmacionPago", () => {
  it("redirige a pago cuando no hay datos guardados en memoria", () => {
    render(
      <PagoProvider>
        <ConfirmacionPago hrefPago="/reserva/pago?espacioId=1" />
      </PagoProvider>,
    );
    expect(replace).toHaveBeenCalledWith("/reserva/pago?espacioId=1");
  });

  it("muestra los últimos 4 dígitos cuando hay datos guardados", () => {
    const { rerender } = render(
      <PagoProvider>
        <Iniciar />
      </PagoProvider>,
    );

    // Segundo render sobre la misma instancia de PagoProvider: el estado
    // (guardado en el efecto anterior) ya está listo antes de que
    // ConfirmacionPago monte, evitando la carrera entre efectos hermanos.
    rerender(
      <PagoProvider>
        <Iniciar />
        <ConfirmacionPago hrefPago="/reserva/pago?espacioId=1" />
      </PagoProvider>,
    );

    expect(screen.getByText(/terminada en 1111/)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
