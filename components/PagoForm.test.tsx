import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PagoForm } from "./PagoForm";
import { PagoProvider, usePago } from "./PagoProvider";
import type { DatosPago } from "@/lib/pago";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

function Spy({ onDatosPago }: { onDatosPago: (datos: DatosPago | null) => void }) {
  const { datosPago } = usePago();
  onDatosPago(datosPago);
  return null;
}

describe("PagoForm", () => {
  it("no muestra errores antes de intentar enviar", () => {
    render(
      <PagoProvider>
        <PagoForm hrefConfirmacion="/reserva/confirmacion" />
      </PagoProvider>,
    );
    expect(screen.queryByText(/debe tener 16 dígitos/)).not.toBeInTheDocument();
  });

  it("muestra errores tras intentar enviar con datos inválidos", () => {
    render(
      <PagoProvider>
        <PagoForm hrefConfirmacion="/reserva/confirmacion" />
      </PagoProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));
    expect(screen.getByText(/debe tener 16 dígitos/)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("guarda los datos en el contexto y navega a confirmación cuando son válidos", () => {
    const onDatosPago = vi.fn();
    render(
      <PagoProvider>
        <PagoForm hrefConfirmacion="/reserva/confirmacion?espacioId=1" />
        <Spy onDatosPago={onDatosPago} />
      </PagoProvider>,
    );

    fireEvent.change(screen.getByLabelText("Número de tarjeta"), {
      target: { value: "4111111111111111" },
    });
    fireEvent.change(screen.getByLabelText("Nombre del titular"), {
      target: { value: "Jose Valor" },
    });
    fireEvent.change(screen.getByLabelText("Expiración (MM/YY)"), {
      target: { value: "09/30" },
    });
    fireEvent.change(screen.getByLabelText("CVV"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(push).toHaveBeenCalledWith("/reserva/confirmacion?espacioId=1");
    expect(onDatosPago).toHaveBeenLastCalledWith(
      expect.objectContaining({ numeroTarjeta: "4111111111111111" }),
    );
  });
});
