import { useMemo, useState } from "react";
import type { SalaryEntry } from "../../data/salaryData";
import {
  USD_TO_IDR,
  cadenceLabels,
  convertSalary,
  currencyLabels,
  formatCurrency,
  type Cadence,
  type CurrencyCode,
} from "../../utils/salary";
import MultiCountryLineChart from "./MultiCountryLineChart";
import CountryComparisonChart from "./CountryComparisonChart";
import SalaryTable from "./SalaryTable";

interface SalaryExplorerProps {
  data: SalaryEntry[];
  exchangeRate?: number;
}

const SalaryExplorer = ({ data, exchangeRate = USD_TO_IDR }: SalaryExplorerProps) => {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [cadence, setCadence] = useState<Cadence>("annual");

  const indonesia = data.find((entry) => entry.country === "Indonesia");

  const topSenior = useMemo(() => {
    return data.reduce(
      (highest, entry) => (entry.senior > highest.senior ? entry : highest),
      data[0] ?? {
        country: "Indonesia",
        band: "Benchmark",
        junior: 0,
        middle: 0,
        senior: 0,
        juniorRatio: 0,
        seniorRatio: 0,
      },
    );
  }, [data]);

  const summaryStats = useMemo(() => {
    const topSeniorValue = convertSalary(topSenior?.senior ?? 0, currency, cadence, exchangeRate);
    const indonesiaSeniorValue = convertSalary(
      indonesia?.senior ?? 0,
      currency,
      cadence,
      exchangeRate,
    );

    return [
      {
        label: "Benchmarked markets",
        value: `${data.length}`,
        tone: "hero" as const,
        description: "Countries included",
      },
      {
        label: `Top senior salary · ${topSenior?.country ?? "–"}`,
        value: formatCurrency(topSeniorValue, currency),
        tone: "positive" as const,
        description: `${cadenceLabels[cadence]} ${currencyLabels[currency]}`,
      },
      {
        label: "Indonesia senior benchmark",
        value: formatCurrency(indonesiaSeniorValue, currency),
        tone: "negative" as const,
        description: `${cadenceLabels[cadence]} ${currencyLabels[currency]}`,
      },
    ];
  }, [cadence, currency, data.length, exchangeRate, indonesia?.senior, topSenior?.country, topSenior?.senior]);

  const handleCurrencyChange = (nextCurrency: CurrencyCode) => {
    setCurrency(nextCurrency);
  };

  const handleCadenceChange = (nextCadence: Cadence) => {
    setCadence(nextCadence);
  };

  return (
    <>
      <section className="hero-card">
        <h1>Indonesia&apos;s product salary position, at a glance.</h1>
        <p>
          Track how Indonesia&apos;s salary benchmarks compare to digital product markets across the
          globe. Switch currency and cadence to see the same data from a different perspective, then
          explore interactive comparisons below.
        </p>

        <div className="filter-row hero-controls" role="group" aria-label="View settings">
          <div className="filter-group">
            <label>Currency</label>
            <div className="view-toggle" role="group" aria-label="Currency selection">
              <button
                type="button"
                aria-pressed={currency === "USD"}
                onClick={() => handleCurrencyChange("USD")}
              >
                USD
              </button>
              <button
                type="button"
                aria-pressed={currency === "IDR"}
                onClick={() => handleCurrencyChange("IDR")}
              >
                IDR
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label>Cadence</label>
            <div className="view-toggle" role="group" aria-label="Cadence selection">
              <button
                type="button"
                aria-pressed={cadence === "annual"}
                onClick={() => handleCadenceChange("annual")}
              >
                Annual
              </button>
              <button
                type="button"
                aria-pressed={cadence === "monthly"}
                onClick={() => handleCadenceChange("monthly")}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="comparison-summary hero-summary" aria-live="polite">
          {summaryStats.map((stat) => (
            <div key={stat.label} className={`summary-card summary-card--${stat.tone}`}>
              <strong>{stat.label}</strong>
              <span>{stat.value}</span>
              {stat.description && <p>{stat.description}</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Growth across seniority</h2>
          <p>
            Compare how salaries scale from junior to senior roles. Toggle between individual markets
            or averaged band groupings to understand which ecosystems accelerate faster.
          </p>
        </div>
        <MultiCountryLineChart
          data={data}
          currency={currency}
          cadence={cadence}
          exchangeRate={exchangeRate}
        />
      </section>

      <section>
        <div className="section-title">
          <h2>Indonesia vs. the world</h2>
          <p>
            Choose a specific market to benchmark Indonesia against. Spot gaps at each seniority
            level and quantify percentage differences instantly.
          </p>
        </div>
        <CountryComparisonChart
          data={data}
          currency={currency}
          cadence={cadence}
          exchangeRate={exchangeRate}
        />
      </section>

      <section>
        <div className="section-title">
          <h2>Inspect the dataset</h2>
          <p>
            Sort and filter the reference table to explore each country&apos;s benchmark. Export the view
            in your current currency and cadence for further analysis.
          </p>
        </div>
        <SalaryTable
          data={data}
          currency={currency}
          cadence={cadence}
          exchangeRate={exchangeRate}
        />
      </section>
    </>
  );
};

export default SalaryExplorer;
