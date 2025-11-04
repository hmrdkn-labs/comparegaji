import type { SalaryEntry, Band } from "../data/salaryData";

export const seniorityOrder = ["junior", "middle", "senior"] as const;

export type SeniorityKey = (typeof seniorityOrder)[number];

export const seniorityLabels: Record<SeniorityKey, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
};

export const bandOrder: Band[] = [
  "Benchmark",
  "Low Band",
  "Middle Band",
  "High Band",
  "Top Band",
];

export type CurrencyCode = "USD" | "IDR";
export type Cadence = "annual" | "monthly";

export const cadenceLabels: Record<Cadence, string> = {
  annual: "Annual",
  monthly: "Monthly",
};

export const USD_TO_IDR = 15500;

export const currencyLabels: Record<CurrencyCode, string> = {
  USD: "USD",
  IDR: "IDR",
};

export function getCountriesByBand(data: SalaryEntry[], band?: Band) {
  if (!band) {
    return data;
  }

  return data.filter((entry) => entry.band === band);
}

export interface BandAverage {
  band: Band;
  junior: number;
  middle: number;
  senior: number;
}

export function getBandAverages(data: SalaryEntry[]): BandAverage[] {
  const result: BandAverage[] = [];

  for (const band of bandOrder) {
    const entries = data.filter((entry) => entry.band === band);
    if (!entries.length) {
      continue;
    }

    const totals = entries.reduce(
      (acc, current) => {
        acc.junior += current.junior;
        acc.middle += current.middle;
        acc.senior += current.senior;
        return acc;
      },
      { junior: 0, middle: 0, senior: 0 },
    );

    result.push({
      band,
      junior: Math.round(totals.junior / entries.length),
      middle: Math.round(totals.middle / entries.length),
      senior: Math.round(totals.senior / entries.length),
    });
  }

  return result;
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
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAxisValue(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: currency === "USD" ? 1 : 1,
  }).format(value);
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
