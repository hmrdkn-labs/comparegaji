import { useEffect, useMemo, useState } from "react";
import {
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
  bandOrder,
  cadenceLabels,
  convertSalary,
  currencyLabels,
  formatAxisValue,
  formatCurrency,
  getBandAverages,
  seniorityLabels,
  seniorityOrder,
  type Cadence,
  type CurrencyCode,
} from "../../utils/salary";

type ViewMode = "countries" | "bands";

interface MultiCountryLineChartProps {
  data: SalaryEntry[];
  currency: CurrencyCode;
  cadence: Cadence;
  exchangeRate?: number;
}

const defaultCountries = ["Indonesia", "United States", "India", "Singapore"];

const palette = [
  "#0F9D58",
  "#4285F4",
  "#F4B400",
  "#1A73E8",
  "#34A853",
  "#F9AB00",
  "#185ABC",
  "#0B8043",
  "#174EA6",
  "#2F9E44",
  "#8AB4F8",
  "#AECBFA",
];

const bandColors: Record<Band, string> = {
  Benchmark: "#0F9D58",
  "Low Band": "#34A853",
  "Middle Band": "#4285F4",
  "High Band": "#1A73E8",
  "Top Band": "#F4B400",
};

const MultiCountryLineChart = ({
  data,
  currency,
  cadence,
  exchangeRate,
}: MultiCountryLineChartProps) => {
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
      const averages = getBandAverages(data);
      const lines = averages.map((entry) => ({
        key: entry.band,
        label: entry.band,
        stroke: bandColors[entry.band],
      }));

      const chartData = seniorityOrder.map((level) => {
        const row: Record<string, string | number> = {
          level: seniorityLabels[level],
        };

        averages.forEach((average) => {
          row[average.band] = convertSalary(average[level], currency, cadence, exchangeRate);
        });

        return row;
      });

      return {
        lines,
        chartData,
      };
    }

    const lines = selectedCountries.map((country, index) => ({
      key: country,
      label: country,
      stroke: palette[index % palette.length],
    }));

    const chartData = seniorityOrder.map((level) => {
      const row: Record<string, string | number> = {
        level: seniorityLabels[level],
      };

      selectedCountries.forEach((country) => {
        const entry = dataByCountry.get(country);
        if (entry) {
          row[country] = convertSalary(entry[level], currency, cadence, exchangeRate);
        }
      });

      return row;
    });

    return {
      lines,
      chartData,
    };
  }, [cadence, currency, data, dataByCountry, exchangeRate, selectedCountries, viewMode]);

  const toggleCountry = (country: string) => {
    setSelectedCountries((current) => {
      if (current.includes(country)) {
        return current.filter((item) => item !== country);
      }

      return [...current, country];
    });
  };

  const disabledCountrySelection = viewMode === "bands";
  const tooltipFormatter = (value: number, name: string) => [
    formatCurrency(value, currency),
    name,
  ];

  const axisFormatter = (val: number) => formatAxisValue(val, currency);
  const footnote = `Salary values shown in ${currencyLabels[currency]} (${cadenceLabels[cadence].toLowerCase()}).`;

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <strong>How salaries scale with seniority</strong>
          <p>
            Visualise how compensation grows from junior to senior roles. Compare individual nations
            or look at averages by band classification.
          </p>
        </div>
        <div className="view-toggle" role="group" aria-label="Chart view mode">
          <button
            type="button"
            aria-pressed={viewMode === "countries"}
            onClick={() => setViewMode("countries")}
          >
            Countries
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "bands"}
            onClick={() => setViewMode("bands")}
          >
            Bands
          </button>
        </div>
      </div>

      <div className="filter-row" aria-hidden={disabledCountrySelection}>
        <div className="filter-group">
          <label htmlFor="band-filter">Band filter</label>
          <div className="pill-select">
            <select
              id="band-filter"
              disabled={viewMode === "bands"}
              value={selectedBand}
              onChange={(event) => setSelectedBand(event.target.value as "All" | Band)}
            >
              <option value="All">All bands</option>
              {bandOrder.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </div>
        </div>
        {disabledCountrySelection && (
          <span className="pill-select" aria-live="polite">
            Comparing averages per band
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
          return (
            <label
              key={entry.country}
              className="country-chip"
              data-active={active}
              aria-checked={active}
              role="option"
            >
              <input
                type="checkbox"
                checked={active}
                disabled={disabledCountrySelection}
                onChange={() => toggleCountry(entry.country)}
              />
              {entry.country}
            </label>
          );
        })}
        {!availableCountries.length && <span>No countries available for the selected band.</span>}
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartConfig.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(17, 17, 17, 0.15)" />
            <XAxis dataKey="level" tick={{ fill: "#333", fontSize: 12 }} />
            <YAxis tickFormatter={axisFormatter} tick={{ fill: "#333", fontSize: 12 }} width={110} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
            {chartConfig.lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.stroke}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-footnote">{footnote}</p>
    </div>
  );
};

export default MultiCountryLineChart;
