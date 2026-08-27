export type MarketCode = "LATAM" | "US" | "EU";

export interface Market {
  code: MarketCode;
  currency: "CLP" | "USD" | "EUR";
  locale: string;
}

const FALLBACK_MARKET: Market = { code: "US", currency: "USD", locale: "en-US" };

const LATAM_REGIONS = new Set([
  "CL", "AR", "MX", "CO", "PE", "UY", "EC", "BO", "PY", "VE", "CR", "PA",
  "GT", "HN", "SV", "NI", "DO",
]);

const EUROZONE_REGIONS = new Set([
  "ES", "FR", "DE", "IT", "PT", "NL", "BE", "AT", "IE", "FI", "GR", "LU",
  "SK", "SI", "EE", "LV", "LT", "CY", "MT", "HR",
]);

function marketForRegion(tag: string, region: string): Market | null {
  if (LATAM_REGIONS.has(region)) return { code: "LATAM", currency: "CLP", locale: tag };
  if (EUROZONE_REGIONS.has(region)) return { code: "EU", currency: "EUR", locale: tag };
  if (region === "US") return { code: "US", currency: "USD", locale: tag };
  return null;
}

/** Prioriza la región del locale sobre el idioma (ej. "es-ES" -> EU, no LATAM). */
export function resolveMarket(acceptLanguage: string | null): Market {
  if (!acceptLanguage) return FALLBACK_MARKET;

  const tags = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0])
    .filter(Boolean);

  for (const tag of tags) {
    const region = tag.split("-")[1]?.toUpperCase();
    if (!region) continue;
    const market = marketForRegion(tag, region);
    if (market) return market;
  }

  return FALLBACK_MARKET;
}

/** fecha en formato YYYY-MM-DD. Se construye con componentes locales para evitar
 * el corrimiento de un día que produce parsear la fecha como UTC. */
export function formatDate(fecha: string, market: Market): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const date = new Date(anio, mes - 1, dia);
  return new Intl.DateTimeFormat(market.locale, { dateStyle: "long" }).format(date);
}
