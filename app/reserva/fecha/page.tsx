import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { ReservaFechaForm } from "@/components/ReservaFechaForm";
import { ReservaStepper } from "@/components/ReservaStepper";
import { ESPACIOS_MOCK } from "@/lib/espacios";
import { VARIANT_COOKIE, type Variant } from "@/lib/experiment";
import { pasoTrasFecha } from "@/lib/flujo";

export default async function ReservaFechaPage({
  searchParams,
}: {
  searchParams: Promise<{ espacioId?: string }>;
}) {
  const { espacioId } = await searchParams;
  const espacio = ESPACIOS_MOCK.find((e) => e.id === espacioId);

  if (!espacio) {
    notFound();
  }

  const cookieStore = await cookies();
  const variant = (cookieStore.get(VARIANT_COOKIE)?.value as Variant | undefined) ?? "base";
  const siguientePaso = pasoTrasFecha(variant);

  return (
    <Container>
      <ReservaStepper
        variant={variant}
        pasoActual="fecha"
        params={new URLSearchParams({ espacioId: espacio.id })}
      />
      <h1 className="text-fluid-2xl font-semibold tracking-tight mb-fluid-2xs">
        Selección de fecha y hora
      </h1>
      <p className="text-fluid-base text-muted mb-fluid-md">
        {espacio.nombre} · {espacio.ubicacion}
      </p>
      <Suspense>
        <ReservaFechaForm espacio={espacio} siguientePaso={siguientePaso} />
      </Suspense>
    </Container>
  );
}
