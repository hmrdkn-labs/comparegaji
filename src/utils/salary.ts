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

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
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
