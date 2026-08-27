import { cookies, headers } from "next/headers";
import { CatalogoEspacios } from "@/components/CatalogoEspacios";
import { VARIANT_COOKIE, type Variant } from "@/lib/experiment";
import { ESPACIOS_MOCK } from "@/lib/espacios";
import { layoutForVariant } from "@/lib/layout";
import { resolveMarket } from "@/lib/market";

export default async function Home() {
  const cookieStore = await cookies();
  const headersList = await headers();

  const variant = (cookieStore.get(VARIANT_COOKIE)?.value as Variant | undefined) ?? "base";
  const layout = layoutForVariant(variant);
  const market = resolveMarket(headersList.get("accept-language"));

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Coworking — catálogo de espacios</h1>
      <CatalogoEspacios espacios={ESPACIOS_MOCK} market={market} layout={layout} />
    </main>
  );
}
