import type { SalaryEntry, Band } from "../data/salaryData";

export const seniorityOrder = ["junior", "middle", "senior"] as const;

export type SeniorityKey = (typeof seniorityOrder)[number];
export type CurrencyCode = "USD" | "IDR";
export type Cadence = "annual" | "monthly";
export type LanguageCode = "en" | "id";

export const bandOrder: Band[] = [
  "Benchmark",
  "Low Band",
  "Middle Band",
  "High Band",
  "Top Band",
];

export const USD_TO_IDR = 15500;

export const bandColors: Record<Band, string> = {
  Benchmark: "#16A34A",
  "Low Band": "#2DD36F",
  "Middle Band": "#2563EB",
  "High Band": "#1D4ED8",
  "Top Band": "#F4B400",
};

export const countryPalette: string[] = [
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#a855f7",
  "#0ea5e9",
  "#facc15",
  "#14b8a6",
  "#ec4899",
  "#8b5cf6",
  "#6366f1",
  "#fb7185",
];

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

export const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  IDR: "Rp",
};

export const countryFlags: Record<string, string> = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Switzerland: "🇨🇭",
  Singapore: "🇸🇬",
  Netherlands: "🇳🇱",
  Ireland: "🇮🇪",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Taiwan: "🇹🇼",
  "South Korea": "🇰🇷",
  Japan: "🇯🇵",
  Spain: "🇪🇸",
  Poland: "🇵🇱",
  "Czech Rep.": "🇨🇿",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Malaysia: "🇲🇾",
  Vietnam: "🇻🇳",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
  India: "🇮🇳",
  Egypt: "🇪🇬",
};

export function getCountryWithFlag(countryName: string): string {
  const flag = countryFlags[countryName];
  return flag ? `${flag} ${countryName}` : countryName;
}

export function getSeniorityLabels(language: LanguageCode) {
  return seniorityLabelsByLanguage[language] ?? seniorityLabelsByLanguage.en;
}

export function getCadenceLabel(language: LanguageCode, cadence: Cadence) {
  const map = cadenceLabelsByLanguage[language] ?? cadenceLabelsByLanguage.en;
  return map[cadence];
}

export function getCountriesByBand(data: SalaryEntry[], band?: Band | "All") {
  if (!band || band === "All") {
    return data;
  }

  return data.filter((entry) => entry.band === band);
}

export interface BandDistribution {
  band: Band;
  averages: Record<SeniorityKey, number>;
  minimums: Record<SeniorityKey, number>;
  maximums: Record<SeniorityKey, number>;
}

export function getBandDistributions(data: SalaryEntry[]): BandDistribution[] {
  const result: BandDistribution[] = [];

  for (const band of bandOrder) {
    const entries = data.filter((entry) => entry.band === band);
    if (!entries.length) {
      continue;
    }

    const averages = { junior: 0, middle: 0, senior: 0 } as Record<
      SeniorityKey,
      number
    >;
    const minimums = {
      junior: Number.POSITIVE_INFINITY,
      middle: Number.POSITIVE_INFINITY,
      senior: Number.POSITIVE_INFINITY,
    } as Record<SeniorityKey, number>;
    const maximums = {
      junior: Number.NEGATIVE_INFINITY,
      middle: Number.NEGATIVE_INFINITY,
      senior: Number.NEGATIVE_INFINITY,
    } as Record<SeniorityKey, number>;

    for (const level of seniorityOrder) {
      const values = entries.map((entry) => entry[level]);
      const total = values.reduce((acc, current) => acc + current, 0);
      averages[level] = Math.round(total / values.length);
      minimums[level] = Math.min(...values);
      maximums[level] = Math.max(...values);
    }

    result.push({
      band,
      averages,
      minimums,
      maximums,
    });
  }

  return result;
}

export function getBandDistribution(data: SalaryEntry[], band: Band) {
  const distributions = getBandDistributions(data);
  return (
    distributions.find((distribution) => distribution.band === band) ?? null
  );
}

export function convertSalary(
  valueAnnualUSD: number,
  currency: CurrencyCode,
  cadence: Cadence,
  exchangeRate = USD_TO_IDR,
) {
  let amount = valueAnnualUSD;
  if (cadence === "monthly") {
    amount = amount / 12;
  }

  if (currency === "IDR") {
    amount = amount * exchangeRate;
  }

  return amount;
}

export function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 0 : 0,
  }).format(value);
}

export function formatAxisValue(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function colorWithAlpha(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function sortByKey<T extends Record<string, unknown>>(
  data: T[],
  key: keyof T,
  direction: "asc" | "desc",
) {
  return [...data].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    if (typeof left === "number" && typeof right === "number") {
      return direction === "asc" ? left - right : right - left;
    }

    return direction === "asc"
      ? String(left).localeCompare(String(right))
      : String(right).localeCompare(String(left));
  });
}
