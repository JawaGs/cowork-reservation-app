import type { Market } from "./market";

// Tasas fijas mock (no reflejan tipo de cambio real ni se actualizan vía API).
const EXCHANGE_RATES_MOCK: Record<Market["currency"], number> = {
  USD: 1,
  CLP: 950,
  EUR: 0.92,
};

export function convertPrice(usdAmount: number, currency: Market["currency"]): number {
  return usdAmount * EXCHANGE_RATES_MOCK[currency];
}

export function formatPrice(usdAmount: number, market: Market): string {
  const converted = convertPrice(usdAmount, market.currency);
  return new Intl.NumberFormat(market.locale, {
    style: "currency",
    currency: market.currency,
    maximumFractionDigits: market.currency === "CLP" ? 0 : 2,
  }).format(converted);
}
