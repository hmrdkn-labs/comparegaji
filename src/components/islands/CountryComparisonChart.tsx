import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalaryEntry } from "../../data/salaryData";
import {
  formatCompact,
  formatCurrency,
  seniorityLabels,
  seniorityOrder,
} from "../../utils/salary";

interface CountryComparisonChartProps {
  data: SalaryEntry[];
}

const CountryComparisonChart = ({ data }: CountryComparisonChartProps) => {
  const indonesia = data.find((entry) => entry.country === "Indonesia");
  const countries = useMemo(
    () =>
      data
        .filter((entry) => entry.country !== "Indonesia")
        .sort((a, b) => a.country.localeCompare(b.country)),
    [data],
  );

  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((entry) => entry.band.includes("Top"))?.country ??
      countries[0]?.country ??
      "",
  );

  const selectedEntry = data.find((entry) => entry.country === selectedCountry);

  const chartData = useMemo(() => {
    if (!indonesia || !selectedEntry) {
      return [];
    }

    return seniorityOrder.map((level) => {
      const indonesiaValue = indonesia[level];
      const targetValue = selectedEntry[level];
      const delta = targetValue - indonesiaValue;
      const deltaPct = indonesiaValue ? (delta / indonesiaValue) * 100 : 0;

      return {
        level: seniorityLabels[level],
        Indonesia: indonesiaValue,
        [selectedEntry.country]: targetValue,
        delta,
        deltaPct,
      };
    });
  }, [indonesia, selectedEntry]);

  if (!indonesia || !countries.length || !selectedEntry) {
    return (
      <div className="card chart-card">
        <strong>Indonesia comparison</strong>
        <p>
          We need at least one other country to run a side-by-side comparison.
        </p>
      </div>
    );
  }

  const seniorRow = chartData.find(
    (row) => row.level === seniorityLabels.senior,
  );
  const middleRow = chartData.find(
    (row) => row.level === seniorityLabels.middle,
  );
  const juniorRow = chartData.find(
    (row) => row.level === seniorityLabels.junior,
  );

  const formatDelta = (value?: number) => {
    if (value === undefined || !Number.isFinite(value)) {
      return "N/A";
    }

    if (value === 0) {
      return "Even";
    }

    if (value > 0) {
      return `+${formatCurrency(value)}`;
    }

    return formatCurrency(value);
  };

  const formatDeltaPct = (value?: number) => {
    if (value === undefined || !Number.isFinite(value)) {
      return "N/A";
    }
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
  };

  const classifyDelta = (value?: number) => {
    if (value === undefined || !Number.isFinite(value)) {
      return "";
    }

    if (value > 0) {
      return "summary-card--positive";
    }
    if (value < 0) {
      return "summary-card--negative";
    }
    return "";
  };

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <strong>Indonesia vs. a target market</strong>
          <p>
            Select a country to see how Indonesia&apos;s salary benchmarks stack
            up at each seniority level.
          </p>
        </div>
        <div className="filter-group">
          <label htmlFor="comparison-country">Compare with</label>
          <div className="pill-select">
            <select
              id="comparison-country"
              value={selectedCountry}
              onChange={(event) => setSelectedCountry(event.target.value)}
            >
              {countries.map((entry) => (
                <option key={entry.country} value={entry.country}>
                  {entry.country} - {entry.band}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} barCategoryGap={24}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(17, 17, 17, 0.15)"
            />
            <XAxis dataKey="level" tick={{ fill: "#333", fontSize: 12 }} />
            <YAxis
              tickFormatter={formatCompact}
              tick={{ fill: "#333", fontSize: 12 }}
              width={90}
            />
            <Tooltip
              formatter={(value: number, key) => [
                formatCurrency(value as number),
                key,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
            <Bar
              dataKey="Indonesia"
              fill="rgba(15, 157, 88, 0.8)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey={selectedEntry.country}
              fill="rgba(66, 133, 244, 0.85)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="comparison-summary" aria-live="polite">
        <div className={`summary-card ${classifyDelta(seniorRow?.delta)}`}>
          <strong>Senior gap</strong>
          <span>{formatDelta(seniorRow?.delta ?? 0)}</span>
          <p>{formatDeltaPct(seniorRow?.deltaPct)}</p>
        </div>
        <div className={`summary-card ${classifyDelta(middleRow?.delta)}`}>
          <strong>Mid-level gap</strong>
          <span>{formatDelta(middleRow?.delta ?? 0)}</span>
          <p>{formatDeltaPct(middleRow?.deltaPct)}</p>
        </div>
        <div className={`summary-card ${classifyDelta(juniorRow?.delta)}`}>
          <strong>Junior gap</strong>
          <span>{formatDelta(juniorRow?.delta ?? 0)}</span>
          <p>{formatDeltaPct(juniorRow?.deltaPct)}</p>
        </div>
      </div>
    </div>
  );
};

export default CountryComparisonChart;
