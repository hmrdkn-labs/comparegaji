import { Fragment, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalaryEntry, Band } from "../../data/salaryData";
import {
  bandColors,
  bandOrder,
  colorWithAlpha,
  convertSalary,
  countryPalette,
  formatAxisValue,
  formatCurrency,
  getBandDistributions,
  getBandDistribution,
  getCadenceLabel,
  seniorityOrder,
  type Cadence,
  type CurrencyCode,
  type LanguageCode,
  type SeniorityKey,
} from "../../utils/salary";

type ViewMode = "countries" | "bands";
type ChartMode = "countries" | "bandsAll" | "bandDetail";

interface MultiCountryLineChartCopy {
  title: string;
  description: string;
  countriesLabel: string;
  bandsLabel: string;
  bandFilterLabel: string;
  bandHelper: string;
  emptyState: string;
  footnoteCountries: string;
  footnoteBands: string;
  rangeLabels: {
    min: string;
    max: string;
  };
  compareLabel: string;
  comparePlaceholder: string;
  benchmarkLabel: string;
}

interface MultiCountryLineChartProps {
  data: SalaryEntry[];
  currency: CurrencyCode;
  cadence: Cadence;
  language: LanguageCode;
  seniorityLabels: Record<SeniorityKey, string>;
  copy: MultiCountryLineChartCopy;
  exchangeRate?: number;
}

interface LineConfig {
  key: string;
  label: string;
  stroke: string;
  strokeDasharray?: string;
  strokeWidth?: number;
}

interface RangeConfig {
  band: Band;
  minKey: string;
  deltaKey: string;
  stackId: string;
  color: string;
}

const defaultCountries = ["Indonesia", "United States", "India", "Singapore"];

type ChartRow = Record<string, string | number>;

const MultiCountryLineChart = ({
  data,
  currency,
  cadence,
  language,
  seniorityLabels,
  copy,
  exchangeRate,
}: MultiCountryLineChartProps) => {
  const bandDistributions = useMemo(() => getBandDistributions(data), [data]);
  const benchmarkDistribution = useMemo(() => getBandDistribution(data, "Benchmark"), [data]);
  const indonesiaEntry = useMemo(
    () => data.find((entry) => entry.country === "Indonesia"),
    [data],
  );

  const countryColorMap = useMemo(() => {
    const sorted = [...new Set(data.map((entry) => entry.country))].sort((a, b) =>
      a.localeCompare(b),
    );
    const map = new Map<string, string>();
    sorted.forEach((country, index) => {
      map.set(country, countryPalette[index % countryPalette.length]);
    });
    return map;
  }, [data]);

  const initialCountries = useMemo(() => {
    const available = data.map((entry) => entry.country);
    const seeded = defaultCountries.filter((country) => available.includes(country));
    if (seeded.length) {
      return seeded;
    }

    return available.slice(0, Math.min(available.length, 4));
  }, [data]);

  const [viewMode, setViewMode] = useState<ViewMode>("countries");
  const [selectedBand, setSelectedBand] = useState<"All" | Band>("All");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialCountries);
  const [bandCompareCountry, setBandCompareCountry] = useState<string>("");

  const dataByCountry = useMemo(() => {
    return new Map(data.map((entry) => [entry.country, entry]));
  }, [data]);

  const bandFilteredEntries = useMemo(() => {
    if (selectedBand === "All") {
      return data;
    }

    return data.filter((entry) => entry.band === selectedBand);
  }, [data, selectedBand]);

  const availableCountries = useMemo(() => {
    const unique = new Map<string, SalaryEntry>();
    bandFilteredEntries.forEach((entry) => {
      if (!unique.has(entry.country)) {
        unique.set(entry.country, entry);
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.country.localeCompare(b.country));
  }, [bandFilteredEntries]);

  useEffect(() => {
    if (viewMode !== "countries") {
      return;
    }
    const available = availableCountries.map((entry) => entry.country);
    setSelectedCountries((current) => {
      const filtered = current.filter((country) => available.includes(country));
      if (filtered.length) {
        return filtered;
      }
      return available.slice(0, Math.min(available.length, 4));
    });
  }, [availableCountries, viewMode]);

  const bandCountryOptions = useMemo(() => {
    if (selectedBand === "All") {
      return [];
    }
    return data
      .filter((entry) => entry.band === selectedBand && entry.country !== "Indonesia")
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [data, selectedBand]);

  useEffect(() => {
    if (selectedBand === "All") {
      setBandCompareCountry("");
      return;
    }

    if (!bandCountryOptions.some((entry) => entry.country === bandCompareCountry)) {
      setBandCompareCountry("");
    }
  }, [selectedBand, bandCountryOptions, bandCompareCountry]);

  const bandCompareEntry = useMemo(
    () => bandCountryOptions.find((entry) => entry.country === bandCompareCountry),
    [bandCountryOptions, bandCompareCountry],
  );

  const chartConfig = useMemo(() => {
    if (viewMode === "bands" && selectedBand !== "All") {
      const distribution = getBandDistribution(data, selectedBand);
      const fillColor = bandColors[selectedBand];
      const hasRange = Boolean(
        distribution &&
          seniorityOrder.some(
            (level) => distribution.minimums[level] !== distribution.maximums[level],
          ),
      );

      const chartData: ChartRow[] = seniorityOrder.map((level) => {
        const row: ChartRow = { level: seniorityLabels[level] };

        const benchmarkValue = benchmarkDistribution
          ? convertSalary(
              benchmarkDistribution.averages[level],
              currency,
              cadence,
              exchangeRate,
            )
          : indonesiaEntry
          ? convertSalary(indonesiaEntry[level], currency, cadence, exchangeRate)
          : undefined;

        if (typeof benchmarkValue === "number") {
          row.Benchmark = benchmarkValue;
        }

        let minValue: number | undefined;
        let maxValue: number | undefined;

        if (distribution) {
          minValue = convertSalary(
            distribution.minimums[level],
            currency,
            cadence,
            exchangeRate,
          );
          maxValue = convertSalary(
            distribution.maximums[level],
            currency,
            cadence,
            exchangeRate,
          );
        }

        if (typeof minValue !== "number" || typeof maxValue !== "number") {
          const fallback = typeof benchmarkValue === "number" ? benchmarkValue : 0;
          minValue = fallback;
          maxValue = fallback;
        }

        if (!hasRange) {
          minValue = maxValue;
        }

        row.BandBaseline = minValue;
        row.BandRange = Math.max(maxValue - minValue, 0);
        row.BandMinLine = minValue;
        row.BandMaxLine = maxValue;

        if (bandCompareEntry) {
          row[bandCompareEntry.country] = convertSalary(
            bandCompareEntry[level],
            currency,
            cadence,
            exchangeRate,
          );
        }

        return row;
      });

      const lines: LineConfig[] = [];

      if (chartData.some((row) => typeof row.Benchmark === "number")) {
        lines.push({
          key: "Benchmark",
          label: copy.benchmarkLabel,
          stroke: bandColors.Benchmark,
        });
      }

      if (hasRange) {
        lines.push({
          key: "BandMinLine",
          label: copy.rangeLabels.min.replace("%band%", selectedBand),
          stroke: colorWithAlpha(fillColor, 0.6),
          strokeDasharray: "6 6",
          strokeWidth: 2,
        });
      }

      lines.push({
        key: "BandMaxLine",
        label: copy.rangeLabels.max.replace("%band%", selectedBand),
        stroke: fillColor,
      });

      if (bandCompareEntry) {
        lines.push({
          key: bandCompareEntry.country,
          label: bandCompareEntry.country,
          stroke: countryColorMap.get(bandCompareEntry.country) ?? "#2563eb",
        });
      }

      return {
        mode: "bandDetail" as ChartMode,
        lines,
        chartData,
        hasRange,
        fillColor,
      };
    }

    if (viewMode === "bands") {
      const lines: LineConfig[] = bandDistributions.map((distribution) => ({
        key: `${distribution.band}|avg`,
        label: distribution.band,
        stroke: bandColors[distribution.band],
      }));

      const ranges: RangeConfig[] = bandDistributions.map((distribution) => ({
        band: distribution.band,
        minKey: `${distribution.band}|min`,
        deltaKey: `${distribution.band}|delta`,
        stackId: `${distribution.band}-range`,
        color: bandColors[distribution.band],
      }));

      const chartData: ChartRow[] = seniorityOrder.map((level) => {
        const row: ChartRow = { level: seniorityLabels[level] };
        bandDistributions.forEach((distribution) => {
          const average = convertSalary(
            distribution.averages[level],
            currency,
            cadence,
            exchangeRate,
          );
          const minimum = convertSalary(
            distribution.minimums[level],
            currency,
            cadence,
            exchangeRate,
          );
          const maximum = convertSalary(
            distribution.maximums[level],
            currency,
            cadence,
            exchangeRate,
          );

          row[`${distribution.band}|avg`] = average;
          row[`${distribution.band}|min`] = minimum;
          row[`${distribution.band}|max`] = maximum;
          row[`${distribution.band}|delta`] = Math.max(maximum - minimum, 0);
        });
        return row;
      });

      return {
        mode: "bandsAll" as ChartMode,
        lines,
        chartData,
        ranges,
        hasRange: false,
      };
    }

    const lines: LineConfig[] = selectedCountries.map((country) => ({
      key: country,
      label: country,
      stroke: countryColorMap.get(country) ?? "#2563eb",
    }));

    const chartData: ChartRow[] = seniorityOrder.map((level) => {
      const row: ChartRow = { level: seniorityLabels[level] };
      selectedCountries.forEach((country) => {
        const entry = dataByCountry.get(country);
        if (entry) {
          row[country] = convertSalary(entry[level], currency, cadence, exchangeRate);
        }
      });
      return row;
    });

    return {
      mode: "countries" as ChartMode,
      lines,
      chartData,
      hasRange: false,
    };
  }, [
    bandCompareEntry,
    bandDistributions,
    benchmarkDistribution,
    cadence,
    copy,
    currency,
    data,
    dataByCountry,
    exchangeRate,
    indonesiaEntry,
    selectedBand,
    selectedCountries,
    seniorityLabels,
    viewMode,
    countryColorMap,
  ]);

  const lineLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    chartConfig.lines.forEach((line) => map.set(line.key, line.label));
    return map;
  }, [chartConfig]);

  const toggleCountry = (country: string) => {
    setSelectedCountries((current) => {
      if (current.includes(country)) {
        return current.filter((item) => item !== country);
      }
      return [...current, country];
    });
  };

  const handleBandSelect = (band: "All" | Band) => {
    setSelectedBand(band);
  };

  const axisFormatter = (value: number) => formatAxisValue(value, currency);
  const footnoteTemplate =
    chartConfig.mode === "countries" ? copy.footnoteCountries : copy.footnoteBands;

  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const containerStyle: CSSProperties = {
      background: "rgba(255,255,255,0.95)",
      border: "1px solid rgba(17,17,17,0.08)",
      borderRadius: 12,
      padding: "0.75rem 0.9rem",
      boxShadow: "0 8px 18px rgba(17,17,17,0.12)",
      maxWidth: 260,
    };

    const entries = payload.filter((item: any) => lineLabelMap.has(item.dataKey));

    if (!entries.length) {
      return null;
    }

    return (
      <div style={containerStyle}>
        <strong style={{ display: "block", marginBottom: "0.35rem" }}>{label}</strong>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "grid",
            gap: "0.35rem",
          }}
        >
          {entries.map((item: any) => (
            <li
              key={item.dataKey}
              style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}
            >
              <span style={{ color: item.color, fontWeight: 600 }}>
                {lineLabelMap.get(item.dataKey) ?? item.name}
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(item.value as number, currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const cadenceLabel = getCadenceLabel(language, cadence).toLowerCase();
  const footnoteText = footnoteTemplate
    .replace("%currency%", currency)
    .replace("%cadence%", cadenceLabel);

  const bandFillColor =
    chartConfig.fillColor ?? bandColors[selectedBand === "All" ? "Benchmark" : selectedBand];

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <strong>{copy.title}</strong>
          <p>{copy.description}</p>
        </div>
        <div className="view-toggle" role="group" aria-label="Chart view mode">
          <button
            type="button"
            aria-pressed={viewMode === "countries"}
            onClick={() => setViewMode("countries")}
          >
            {copy.countriesLabel}
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "bands"}
            onClick={() => setViewMode("bands")}
          >
            {copy.bandsLabel}
          </button>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>{copy.bandFilterLabel}</label>
          <div className="band-toggle" role="group" aria-label={copy.bandFilterLabel}>
            <button
              type="button"
              onClick={() => handleBandSelect("All")}
              aria-pressed={selectedBand === "All"}
              style={{
                backgroundColor:
                  selectedBand === "All" ? "#111111" : "rgba(17, 17, 17, 0.08)",
                color: selectedBand === "All" ? "#ffffff" : "#111111",
              }}
            >
              All
            </button>
            {bandOrder.map((band) => {
              const active = selectedBand === band;
              const baseColor = bandColors[band];
              return (
                <button
                  key={band}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleBandSelect(band)}
                  style={{
                    backgroundColor: active ? baseColor : colorWithAlpha(baseColor, 0.16),
                    color: active ? "#ffffff" : "#111111",
                    borderColor: colorWithAlpha(baseColor, 0.55),
                  }}
                >
                  {band}
                </button>
              );
            })}
          </div>
        </div>

        {chartConfig.mode === "bandDetail" && (
          <span className="band-helper" aria-live="polite">
            {copy.bandHelper}
          </span>
        )}

        {chartConfig.mode === "bandDetail" && bandCountryOptions.length > 0 && (
          <div className="filter-group">
            <label htmlFor="band-country-select">{copy.compareLabel}</label>
            <div className="pill-select pill-select--wide">
              <select
                id="band-country-select"
                value={bandCompareCountry}
                onChange={(event) => setBandCompareCountry(event.target.value)}
              >
                <option value="">{copy.comparePlaceholder}</option>
                {bandCountryOptions.map((entry) => (
                  <option key={entry.country} value={entry.country}>
                    {entry.country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {chartConfig.mode === "countries" && (
        <div className="country-grid" role="listbox" aria-label="Select countries to display">
          {availableCountries.map((entry) => {
            const active = selectedCountries.includes(entry.country);
            const color = countryColorMap.get(entry.country) ?? "#94a3b8";
            return (
              <label
                key={entry.country}
                className="country-chip"
                data-active={active}
                aria-checked={active}
                role="option"
                style={{
                  borderColor: colorWithAlpha(color, active ? 0.7 : 0.35),
                  backgroundColor: colorWithAlpha(color, active ? 0.22 : 0.12),
                  color: "#0f172a",
                }}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleCountry(entry.country)}
                  style={{ accentColor: color }}
                />
                {entry.country}
              </label>
            );
          })}
          {!availableCountries.length && <span>{copy.emptyState}</span>}
        </div>
      )}

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartConfig.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(17, 17, 17, 0.15)" />
            <XAxis dataKey="level" tick={{ fill: "#333", fontSize: 12 }} />
            <YAxis tickFormatter={axisFormatter} tick={{ fill: "#333", fontSize: 12 }} width={120} />
            <Tooltip content={renderTooltip} />
            <Legend wrapperStyle={{ fontSize: "0.85rem" }} />

            {chartConfig.mode === "bandsAll" && chartConfig.ranges?.map((range) => (
              <>
                <Area
                  key={`${range.band}-base`}
                  type="monotone"
                  dataKey={range.minKey}
                  stackId={range.stackId}
                  stroke="none"
                  fill="transparent"
                  activeDot={false}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area
                  key={`${range.band}-range`}
                  type="monotone"
                  dataKey={range.deltaKey}
                  stackId={range.stackId}
                  stroke="none"
                  fill={colorWithAlpha(range.color, 0.3)}
                  activeDot={false}
                  isAnimationActive={false}
                  legendType="none"
                />
              </>
            ))}

            {chartConfig.mode === "bandDetail" && (
              <>
                <Area
                  type="monotone"
                  dataKey="BandBaseline"
                  stackId="bandFill"
                  stroke="none"
                  fill="transparent"
                  activeDot={false}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="BandRange"
                  stackId="bandFill"
                  stroke="none"
                  fill={colorWithAlpha(bandFillColor, 0.5)}
                  activeDot={false}
                  isAnimationActive={false}
                  legendType="none"
                />
              </>
            )}

            {chartConfig.lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth ?? 3}
                strokeDasharray={line.strokeDasharray}
                dot={{ r: 4, strokeWidth: 0, fill: line.stroke }}
                activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                name={line.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-footnote">{footnoteText}</p>
    </div>
  );
};

export default MultiCountryLineChart;
