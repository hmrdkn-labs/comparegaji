export type LevelKey = "junior" | "middle" | "senior";

export interface Source {
  id: string;
  publisher: string;
  title: string;
  url: string;
  period: string;
  licence: string;
  licenceUrl: string;
  attribution: string;
}

export interface LevelFigure {
  /** Median gross annual total compensation in the market currency. */
  median: number;
  /** Number of respondents behind the median. */
  n: number;
}

export interface MarketFigure {
  country: string;
  iso2: string;
  flag: string;
  sourceId: string;
  /** ISO 4217 code of the amounts in `levels`; must have a rate in fx.json. */
  currency: string;
  period: string;
  unit: "gross/year";
  levels: Record<LevelKey, LevelFigure | null>;
}

export const levelBasis = {
  en: "Level = years of professional work experience: junior 0–2, middle 3–7, senior 8+.",
  id: "Level = lama pengalaman kerja profesional: junior 0–2 tahun, menengah 3–7 tahun, senior 8+ tahun.",
};

export const sources: Source[] = [
  {
    id: "so-2025",
    publisher: "Stack Overflow",
    title: "2025 Developer Survey (microdata results.csv)",
    url: "https://survey.stackoverflow.co/2025/",
    period: "2025 (fielded 2025-05-29 to 2025-06-23; salaries converted to USD at the 2025-06-25 rate)",
    licence: "ODbL 1.0",
    licenceUrl: "https://opendatacommons.org/licenses/odbl/1-0/",
    attribution: "Data: Stack Overflow Developer Survey 2025, ODbL 1.0",
  },
];

// Medians of ConvertedCompYearly (USD per year, converted by Stack Overflow at the
// 2025-06-25 rate) from the 2025 survey, employed professional developers, by WorkExp.
// A level is null when fewer than 100 respondents. Copied from the sources-draft evidence.
export const markets: MarketFigure[] = [
  {
    country: "India",
    iso2: "IN",
    flag: "🇮🇳",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: { median: 6974, n: 155 },
      middle: { median: 15111, n: 323 },
      senior: { median: 40684, n: 322 },
    },
  },
  {
    country: "Brazil",
    iso2: "BR",
    flag: "🇧🇷",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: { median: 17840, n: 129 },
      senior: { median: 41868, n: 275 },
    },
  },
  {
    country: "Spain",
    iso2: "ES",
    flag: "🇪🇸",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: null,
      senior: { median: 69609, n: 277 },
    },
  },
  {
    country: "Czech Rep.",
    iso2: "CZ",
    flag: "🇨🇿",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: null,
      senior: { median: 65528, n: 138 },
    },
  },
  {
    country: "Poland",
    iso2: "PL",
    flag: "🇵🇱",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: { median: 46120, n: 132 },
      senior: { median: 65496, n: 182 },
    },
  },
  {
    country: "Germany",
    iso2: "DE",
    flag: "🇩🇪",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: { median: 55687, n: 102 },
      middle: { median: 69609, n: 376 },
      senior: { median: 92812, n: 1054 },
    },
  },
  {
    country: "Australia",
    iso2: "AU",
    flag: "🇦🇺",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: null,
      senior: { median: 107916, n: 309 },
    },
  },
  {
    country: "France",
    iso2: "FR",
    flag: "🇫🇷",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: { median: 51046, n: 213 },
      senior: { median: 71929, n: 439 },
    },
  },
  {
    country: "Canada",
    iso2: "CA",
    flag: "🇨🇦",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: { median: 71499, n: 132 },
      senior: { median: 102142, n: 488 },
    },
  },
  {
    country: "United Kingdom",
    iso2: "GB",
    flag: "🇬🇧",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: { median: 74878, n: 233 },
      senior: { median: 104829, n: 822 },
    },
  },
  {
    country: "Netherlands",
    iso2: "NL",
    flag: "🇳🇱",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: { median: 63808, n: 112 },
      senior: { median: 87011, n: 303 },
    },
  },
  {
    country: "Switzerland",
    iso2: "CH",
    flag: "🇨🇭",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: null,
      middle: null,
      senior: { median: 152511, n: 213 },
    },
  },
  {
    country: "United States",
    iso2: "US",
    flag: "🇺🇸",
    sourceId: "so-2025",
    currency: "USD",
    period: "2025",
    unit: "gross/year",
    levels: {
      junior: { median: 89500, n: 192 },
      middle: { median: 120000, n: 754 },
      senior: { median: 170000, n: 2928 },
    },
  },
];

export function getSource(id: string): Source {
  const source = sources.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`sources: unknown sourceId "${id}"`);
  return source;
}

function validate(): void {
  for (const source of sources) {
    for (const field of ["id", "publisher", "title", "url", "period", "licence", "licenceUrl", "attribution"] as const) {
      if (!source[field]) throw new Error(`sources: source "${source.id}" is missing ${field}`);
    }
  }
  for (const market of markets) {
    if (!sources.some((source) => source.id === market.sourceId)) {
      throw new Error(`sources: market "${market.country}" has no resolvable sourceId ("${market.sourceId}")`);
    }
    if (!market.period) throw new Error(`sources: market "${market.country}" has no period`);
    if (!market.currency) throw new Error(`sources: market "${market.country}" has no currency`);
    if (!getSource(market.sourceId).licence) {
      throw new Error(`sources: market "${market.country}" has no licence`);
    }
  }
}

validate();
