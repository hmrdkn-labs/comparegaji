import { useMemo, useState } from "react";
import type { SalaryEntry, Band } from "../../data/salaryData";
import {
  bandOrder,
  cadenceLabels,
  convertSalary,
  currencyLabels,
  formatCurrency,
  seniorityOrder,
  type Cadence,
  type CurrencyCode,
} from "../../utils/salary";

type SortKey =
  | "country"
  | "band"
  | "junior"
  | "middle"
  | "senior"
  | "juniorRatio"
  | "seniorRatio";

interface SalaryTableProps {
  data: SalaryEntry[];
  currency: CurrencyCode;
  cadence: Cadence;
  exchangeRate?: number;
}

const columns: Array<{ key: SortKey; label: string; numeric?: boolean }> = [
  { key: "country", label: "Country" },
  { key: "band", label: "Band" },
  { key: "junior", label: "Junior", numeric: true },
  { key: "middle", label: "Middle", numeric: true },
  { key: "senior", label: "Senior", numeric: true },
  { key: "juniorRatio", label: "Junior Ratio", numeric: true },
  { key: "seniorRatio", label: "Senior Ratio", numeric: true },
];

const SalaryTable = ({ data, currency, cadence, exchangeRate }: SalaryTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("senior");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [bandFilter, setBandFilter] = useState<"All" | Band>("All");

  const filteredData = useMemo(() => {
    if (bandFilter === "All") {
      return data;
    }
    return data.filter((entry) => entry.band === bandFilter);
  }, [bandFilter, data]);

  const processedData = useMemo(() => {
    return filteredData.map((entry) => ({
      entry,
      converted: {
        junior: convertSalary(entry.junior, currency, cadence, exchangeRate),
        middle: convertSalary(entry.middle, currency, cadence, exchangeRate),
        senior: convertSalary(entry.senior, currency, cadence, exchangeRate),
      },
    }));
  }, [filteredData, currency, cadence, exchangeRate]);

  const sortedData = useMemo(() => {
    return [...processedData].sort((a, b) => {
      if (sortKey === "country" || sortKey === "band") {
        const left = a.entry[sortKey];
        const right = b.entry[sortKey];
        return sortDirection === "asc"
          ? String(left).localeCompare(String(right))
          : String(right).localeCompare(String(left));
      }

      if (sortKey === "juniorRatio" || sortKey === "seniorRatio") {
        const left = a.entry[sortKey];
        const right = b.entry[sortKey];
        return sortDirection === "asc" ? left - right : right - left;
      }

      const left = a.converted[sortKey];
      const right = b.converted[sortKey];
      return sortDirection === "asc" ? left - right : right - left;
    });
  }, [processedData, sortDirection, sortKey]);

  const csvContent = useMemo(() => {
    const header = [
      "Country",
      "Band",
      ...seniorityOrder.map((level) => `${level} (${currencyLabels[currency]} ${cadenceLabels[cadence]})`),
      "Junior Ratio",
      "Senior Ratio",
    ].join(",");

    const rows = processedData.map(({ entry, converted }) => {
      const values = [
        entry.country,
        entry.band,
        ...seniorityOrder.map((level) => {
          const amount = converted[level];
          return formatCurrency(amount, currency);
        }),
        entry.juniorRatio.toFixed(1),
        entry.seniorRatio.toFixed(1),
      ];

      return values
        .map((value) => {
          const stringValue = String(value);
          if (stringValue.includes(",")) {
            return `"${stringValue}"`;
          }
          return stringValue;
        })
        .join(",");
    });

    return [header, ...rows].join("\n");
  }, [processedData, currency, cadence]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "country" || key === "band" ? "asc" : "desc");
  };

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const suffix = `${currency.toLowerCase()}-${cadence}`;
    link.href = url;
    link.download = `salary-benchmark-${suffix}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderSortIndicator = (key: SortKey) => {
    if (key !== sortKey) {
      return "";
    }

    return sortDirection === "asc" ? "ASC" : "DESC";
  };

  return (
    <div className="card table-card">
      <div className="table-controls">
        <div className="filter-group">
          <label htmlFor="band-table-filter">Band</label>
          <select
            id="band-table-filter"
            value={bandFilter}
            onChange={(event) => setBandFilter(event.target.value as "All" | Band)}
          >
            <option value="All">All</option>
            {bandOrder.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={handleDownload}>
          Download CSV
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  aria-sort={
                    column.key === sortKey
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  style={{ textAlign: column.numeric ? "right" : "left" }}
                >
                  <span>
                    {column.label}
                    <small>{renderSortIndicator(column.key)}</small>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length ? (
              sortedData.map(({ entry, converted }) => (
                <tr key={entry.country} data-country={entry.country}>
                  <td>{entry.country}</td>
                  <td>{entry.band}</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(converted.junior, currency)}</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(converted.middle, currency)}</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(converted.senior, currency)}</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="ratio-pill">{entry.juniorRatio.toFixed(1)}x</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="ratio-pill">{entry.seniorRatio.toFixed(1)}x</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem 1rem" }}>
                  No records for the selected band.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryTable;
