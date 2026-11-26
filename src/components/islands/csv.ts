import { fxSnapshot, seniorityOrder } from "../../utils/salary";
import { getSource, markets, sources } from "../../data/sources";

const csvCell = (value: string | number | null): string => {
  if (value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** UTF-8 BOM + source line + header with units + one row per sourced market. */
export function buildCsv(): string {
  const currencies = new Set(markets.map((market) => market.currency));
  if (currencies.size !== 1) throw new Error("csv: markets mix currencies");
  const currency = [...currencies][0];

  const attributions = sources.map((source) => source.attribution).join("; ");
  const first = `# Source: ${attributions}; FX: ${fxSnapshot.rates.IDR} IDR/USD ${fxSnapshot.date} ${fxSnapshot.provider}; Licence: ODbL 1.0 (data)`;
  const header = [
    "country",
    "iso2",
    ...seniorityOrder.map((level) => `median_${level}_${currency}_per_year`),
    ...seniorityOrder.map((level) => `n_${level}`),
    "currency",
    "period",
    "source_url",
  ].join(",");

  const rows = markets.map((market) =>
    [
      market.country,
      market.iso2,
      ...seniorityOrder.map((level) => market.levels[level]?.median ?? null),
      ...seniorityOrder.map((level) => market.levels[level]?.n ?? null),
      market.currency,
      market.period,
      getSource(market.sourceId).url,
    ]
      .map(csvCell)
      .join(","),
  );

  return `\uFEFF${[first, header, ...rows].join("\n")}\n`;
}
