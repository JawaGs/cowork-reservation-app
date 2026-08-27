import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ReservaFechaForm } from "@/components/ReservaFechaForm";
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
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Selección de fecha y hora</h1>
      <p className="text-zinc-600 mb-6">
        {espacio.nombre} · {espacio.ubicacion}
      </p>
      <Suspense>
        <ReservaFechaForm espacio={espacio} siguientePaso={siguientePaso} />
      </Suspense>
    </main>
  );
}
