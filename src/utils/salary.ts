import fx from "../data/fx.json";
import { convertAnnual as convertAnnualWithRates } from "./convert.js";
import type { LevelKey, MarketFigure } from "../data/sources";

export const seniorityOrder = ["junior", "middle", "senior"] as const;

export type SeniorityKey = LevelKey;
export type CurrencyCode = "USD" | "IDR";
export type Cadence = "annual" | "monthly";
export type LanguageCode = "en" | "id";

export const fxSnapshot = fx;

const seniorityLabelsByLanguage: Record<
  LanguageCode,
  Record<SeniorityKey, string>
> = {
  en: {
    junior: "Junior",
    middle: "Middle",
    senior: "Senior",
  },
  id: {
    junior: "Junior",
    middle: "Menengah",
    senior: "Senior",
  },
};

const cadenceLabelsByLanguage: Record<LanguageCode, Record<Cadence, string>> = {
  en: {
    annual: "Annual",
    monthly: "Monthly",
  },
  id: {
    annual: "Tahunan",
    monthly: "Bulanan",
  },
};

export const currencyLabels: Record<CurrencyCode, string> = {
  USD: "USD",
  IDR: "IDR",
};

export function getCountryWithFlag(market: Pick<MarketFigure, "flag" | "country">): string {
  return `${market.flag} ${market.country}`;
}

export function getSeniorityLabels(language: LanguageCode) {
  return seniorityLabelsByLanguage[language] ?? seniorityLabelsByLanguage.en;
}

export function getCadenceLabel(language: LanguageCode, cadence: Cadence) {
  const map = cadenceLabelsByLanguage[language] ?? cadenceLabelsByLanguage.en;
  return map[cadence];
}

export function convertAnnual(
  annualAmount: number,
  from: string,
  currency: CurrencyCode,
  cadence: Cadence,
) {
  return convertAnnualWithRates(annualAmount, from, currency, cadence, fx.rates);
}

export function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, language: LanguageCode, digits = 0) {
  return value.toLocaleString(language === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}
