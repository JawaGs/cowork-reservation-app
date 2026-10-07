import { cookies, headers } from "next/headers";
import { CatalogoEspacios } from "@/components/CatalogoEspacios";
import { Container } from "@/components/Container";
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
    <Container size="wide">
      <h1 className="text-fluid-2xl font-semibold tracking-tight mb-fluid-sm">
        Coworking
      </h1>
      <p className="text-fluid-base text-muted mb-fluid-md">
        Encuentra el espacio para trabajar donde estés.
      </p>
      <CatalogoEspacios espacios={ESPACIOS_MOCK} market={market} layout={layout} />
    </Container>
  );
}
