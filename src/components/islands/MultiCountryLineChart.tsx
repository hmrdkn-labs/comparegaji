import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
  getCadenceLabel,
  seniorityOrder,
  type Cadence,
  type CurrencyCode,
  type LanguageCode,
  type SeniorityKey,
} from "../../utils/salary";

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

type ViewMode = "countries" | "bands";

interface LineConfig {
  key: string;
  label: string;
  stroke: string;
}

interface RangeConfig {
  band: Band;
  minKey: string;
  deltaKey: string;
  stackId: string;
  color: string;
}

const defaultCountries = ["Indonesia", "United States", "India", "Singapore"];

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
    return [...bandFilteredEntries].sort((a, b) => a.country.localeCompare(b.country));
  }, [bandFilteredEntries]);

  useEffect(() => {
    if (viewMode === "countries") {
      const available = availableCountries.map((entry) => entry.country);
      setSelectedCountries((current) => {
        const filtered = current.filter((country) => available.includes(country));
        if (filtered.length) {
          return filtered;
        }

        return available.slice(0, Math.min(available.length, 4));
      });
    }
  }, [availableCountries, viewMode]);

  const chartConfig = useMemo(() => {
    if (viewMode === "bands") {
      const lines: LineConfig[] = [];
      const ranges: RangeConfig[] = [];

      const chartData = seniorityOrder.map((level) => {
        const row: Record<string, string | number> = {
          level: seniorityLabels[level],
        };

        bandDistributions.forEach((distribution) => {
          const avgKey = `${distribution.band}|avg`;
          const minKey = `${distribution.band}|min`;
          const deltaKey = `${distribution.band}|delta`;
          const maxKey = `${distribution.band}|max`;

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

          row[avgKey] = average;
          row[minKey] = minimum;
          row[maxKey] = maximum;
          row[deltaKey] = Math.max(maximum - minimum, 0);
        });

        return row;
      });

      bandDistributions.forEach((distribution) => {
        const avgKey = `${distribution.band}|avg`;
        const minKey = `${distribution.band}|min`;
        const deltaKey = `${distribution.band}|delta`;
        const stackId = `${distribution.band}-range`;
        const color = bandColors[distribution.band];

        lines.push({
          key: avgKey,
          label: distribution.band,
          stroke: color,
        });

        ranges.push({
          band: distribution.band,
          minKey,
          deltaKey,
          stackId,
          color,
        });
      });

      return {
        mode: "bands" as const,
        lines,
        chartData,
        ranges,
      };
    }

    const lines: LineConfig[] = [];

    const chartData = seniorityOrder.map((level) => {
      const row: Record<string, string | number> = {
        level: seniorityLabels[level],
      };

      selectedCountries.forEach((country) => {
        const entry = dataByCountry.get(country);
        if (entry) {
          const dataKey = country;
          row[dataKey] = convertSalary(entry[level], currency, cadence, exchangeRate);
        }
      });

      return row;
    });

    selectedCountries.forEach((country, index) => {
      const color = countryColorMap.get(country) ?? countryPalette[index % countryPalette.length];
      lines.push({
        key: country,
        label: country,
        stroke: color,
      });
    });

    return {
      mode: "countries" as const,
      lines,
      chartData,
      ranges: [] as RangeConfig[],
    };
  }, [
    bandDistributions,
    cadence,
    currency,
    dataByCountry,
    exchangeRate,
    selectedCountries,
    seniorityLabels,
    viewMode,
    countryColorMap,
  ]);

  const toggleCountry = (country: string) => {
    setSelectedCountries((current) => {
      if (current.includes(country)) {
        return current.filter((item) => item !== country);
      }

      return [...current, country];
    });
  };

  const disabledCountrySelection = viewMode === "bands";

  const handleBandSelect = (band: "All" | Band) => {
    if (viewMode === "bands") {
      return;
    }
    setSelectedBand(band);
  };

  const axisFormatter = (val: number) => formatAxisValue(val, currency);

  const footnote =
    viewMode === "bands"
      ? copy.footnoteBands
      : copy.footnoteCountries;

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

    if (viewMode === "bands") {
      const bandEntries = payload.filter(
        (item: any) => typeof item.dataKey === "string" && item.dataKey.endsWith("|avg"),
      );

      if (!bandEntries.length) {
        return null;
      }

      return (
        <div style={containerStyle}>
          <strong style={{ display: "block", marginBottom: "0.35rem" }}>{label}</strong>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.35rem" }}>
            {bandEntries.map((item: any) => {
              const dataKey: string = item.dataKey;
              const band = dataKey.split("|")[0] as Band;
              const baseKey = band;
              const row = item.payload as Record<string, number>;
              const average = row[`${baseKey}|avg`];
              const min = row[`${baseKey}|min`];
              const max = row[`${baseKey}|max`];

              return (
                <li key={dataKey} style={{ display: "grid", gap: "0.1rem" }}>
                  <span style={{ color: item.color, fontWeight: 600 }}>{band}</span>
                  <span style={{ fontSize: "0.9rem" }}>
                    {formatCurrency(average, currency)}
                    <span style={{ color: "#64748B", marginLeft: "0.25rem" }}>
                      ({formatCurrency(min, currency)} – {formatCurrency(max, currency)})
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    const countryEntries = payload.filter((item: any) => typeof item.value === "number");
    return (
      <div style={containerStyle}>
        <strong style={{ display: "block", marginBottom: "0.35rem" }}>{label}</strong>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.35rem" }}>
          {countryEntries.map((item: any) => (
            <li key={item.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}>
              <span style={{ color: item.color, fontWeight: 600 }}>{item.name}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.value, currency)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const cadenceLabel = getCadenceLabel(language, cadence).toLowerCase();
  const footnoteText = footnote
    .replace("%currency%", currency)
    .replace("%cadence%", cadenceLabel);

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

      <div className="filter-row" aria-hidden={disabledCountrySelection}>
        <div className="filter-group">
          <label>{copy.bandFilterLabel}</label>
          <div
            className="band-toggle"
            role="group"
            aria-label={copy.bandFilterLabel}
            aria-disabled={disabledCountrySelection}
          >
            <button
              type="button"
              onClick={() => handleBandSelect("All")}
              aria-pressed={selectedBand === "All"}
              disabled={disabledCountrySelection}
              style={{
                backgroundColor:
                  selectedBand === "All"
                    ? "#111111"
                    : "rgba(17,17,17,0.08)",
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
                  disabled={disabledCountrySelection}
                  onClick={() => handleBandSelect(band)}
                  style={{
                    backgroundColor: active
                      ? baseColor
                      : colorWithAlpha(baseColor, 0.16),
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
        {disabledCountrySelection && (
          <span className="pill-select" aria-live="polite">
            {copy.bandHelper}
          </span>
        )}
      </div>

      <div
        className="country-grid"
        data-disabled={disabledCountrySelection ? "true" : "false"}
        role="listbox"
        aria-label="Select countries to display"
      >
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
                disabled={disabledCountrySelection}
                onChange={() => toggleCountry(entry.country)}
                style={{ accentColor: color }}
              />
              {entry.country}
            </label>
          );
        })}
        {!availableCountries.length && <span>{copy.emptyState}</span>}
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartConfig.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(17, 17, 17, 0.15)" />
            <XAxis dataKey="level" tick={{ fill: "#333", fontSize: 12 }} />
            <YAxis tickFormatter={axisFormatter} tick={{ fill: "#333", fontSize: 12 }} width={120} />
            <Tooltip content={renderTooltip} />
            <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
            {chartConfig.ranges.map((range) => (
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
            ))}
            {chartConfig.ranges.map((range) => (
              <Area
                key={`${range.band}-range`}
                type="monotone"
                dataKey={range.deltaKey}
                stackId={range.stackId}
                stroke="none"
                fill={colorWithAlpha(range.color, 0.35)}
                activeDot={false}
                isAnimationActive={false}
                legendType="none"
              />
            ))}
            {chartConfig.lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.stroke}
                strokeWidth={3}
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
