import { useMemo, useState } from "react";
import type { MarketFigure } from "../../data/sources";
import {
  convertAnnual,
  currencyLabels,
  formatCurrency,
  getCadenceLabel,
  getCountryWithFlag,
  seniorityOrder,
  type Cadence,
  type CurrencyCode,
  type LanguageCode,
  type SeniorityKey,
} from "../../utils/salary";
import { buildCsv } from "./csv";
import { noFigureShort, shortSourceLabel, tableCaption } from "./labels";

type SortKey = "country" | SeniorityKey;

interface SalaryTableCopy {
  downloadLabel: string;
  csvNote: string;
  columns: Record<SortKey, string>;
}

interface SalaryTableProps {
  data: MarketFigure[];
  currency: CurrencyCode;
  cadence: Cadence;
  language: LanguageCode;
  copy: SalaryTableCopy;
}

const columnOrder: SortKey[] = ["country", ...seniorityOrder];

const SalaryTable = ({ data, currency, cadence, language, copy }: SalaryTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("senior");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const rows = useMemo(
    () =>
      data.map((market) => ({
        market,
        converted: Object.fromEntries(
          seniorityOrder.map((level) => {
            const point = market.levels[level];
            return [
              level,
              point ? convertAnnual(point.median, market.currency, currency, cadence) : null,
            ];
          }),
        ) as Record<SeniorityKey, number | null>,
      })),
    [data, currency, cadence],
  );

  const sortedRows = useMemo(() => {
    const sign = sortDirection === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === "country") {
        return sign * a.market.country.localeCompare(b.market.country);
      }
      const left = a.converted[sortKey];
      const right = b.converted[sortKey];
      if (left === null && right === null) return a.market.country.localeCompare(b.market.country);
      if (left === null) return 1;
      if (right === null) return -1;
      return sign * (left - right);
    });
  }, [rows, sortDirection, sortKey]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "country" ? "asc" : "desc");
  };

  const handleDownload = () => {
    const blob = new Blob([buildCsv()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "comparegaji-sourced-medians.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const cadenceLabel = getCadenceLabel(language, cadence);

  return (
    <div className="card table-card">
      <div className="table-controls">
        <p className="calc-note">
          {cadenceLabel} {currencyLabels[currency]} · {copy.csvNote}
        </p>
        <button type="button" onClick={handleDownload}>
          {copy.downloadLabel}
        </button>
      </div>

      <div className="table-wrapper">
        <table className="sourced-table">
          <caption>{tableCaption(language)}</caption>
          <thead>
            <tr>
              {columnOrder.map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  aria-sort={
                    key === sortKey
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  style={{ textAlign: key === "country" ? "left" : "right" }}
                >
                  <span>
                    {copy.columns[key]}
                    <small>{key === sortKey ? (sortDirection === "asc" ? "ASC" : "DESC") : ""}</small>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(({ market, converted }) => (
              <tr key={market.country} data-country={market.country}>
                <td>{getCountryWithFlag(market)}</td>
                {seniorityOrder.map((level) => {
                  const value = converted[level];
                  return (
                    <td key={level} style={{ textAlign: "right" }}>
                      {value === null ? (
                        <small className="source-label" data-source-label>
                          {noFigureShort[language]}
                        </small>
                      ) : (
                        <>
                          <span data-figure>{formatCurrency(value, currency)}</span>
                          <small className="source-label" data-source-label>
                            {shortSourceLabel(market, level)}
                          </small>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryTable;
