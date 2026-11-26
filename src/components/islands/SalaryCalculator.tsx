import { useEffect, useMemo, useState } from "react";
import type { SalaryEntry } from "../../data/salaryData";
import {
  convertSalary,
  getCadenceLabel,
  getCountryWithFlag,
  getSeniorityLabels,
  type Cadence,
  type CurrencyCode,
  type LanguageCode,
  type SeniorityKey,
} from "../../utils/salary";
import { MIN_MONTHLY_IDR, parseSalary } from "./parseSalary";

const SALARY_KEY = "comparegaji_user_salary";
const COUNTRIES_KEY = "comparegaji_selected_countries";
const MAX_MARKETS = 3;
const LEVELS: SeniorityKey[] = ["junior", "middle", "senior"];

const copy = {
  en: {
    title: "Compare your salary with the same level abroad",
    description:
      "Enter your monthly rupiah salary, pick your level and up to three markets. Each market shows the figure for the same level and how many times yours it is.",
    salaryLabel: "Your monthly salary (IDR)",
    placeholder: "e.g. 15jt or 15.000.000",
    levelLabel: "Your level",
    marketLabel: (n: number) => `Market ${n}`,
    none: "None",
    parsed: (amount: string) => `Read as ${amount} per month`,
    yours: "Your salary",
    ratio: "Market ÷ yours",
    noMarkets: "Pick at least one market to compare.",
    emptyResult: "Enter your salary to see the comparison.",
    errors: {
      invalid: "Could not read that amount. Try 15jt, 15.000.000 or 15,000,000.",
      empty: "Enter your monthly salary.",
      min: `Salary must be at least Rp${MIN_MONTHLY_IDR.toLocaleString("en-US")} per month.`,
    },
    keptLast: (amount: string) => `Showing the last valid value: ${amount}.`,
    note: "Indicative only. Market figures are unsourced and under review; rupiah conversion uses a fixed rate of Rp15,500 per USD.",
  },
  id: {
    title: "Bandingkan gajimu dengan level yang sama di luar negeri",
    description:
      "Masukkan gaji bulananmu dalam rupiah, pilih level dan hingga tiga pasar. Tiap pasar menampilkan angka untuk level yang sama dan berapa kali lipat gajimu.",
    salaryLabel: "Gaji bulananmu (IDR)",
    placeholder: "mis. 15jt atau 15.000.000",
    levelLabel: "Levelmu",
    marketLabel: (n: number) => `Pasar ${n}`,
    none: "Tidak ada",
    parsed: (amount: string) => `Terbaca ${amount} per bulan`,
    yours: "Gajimu",
    ratio: "Pasar ÷ gajimu",
    noMarkets: "Pilih minimal satu pasar untuk dibandingkan.",
    emptyResult: "Masukkan gajimu untuk melihat perbandingan.",
    errors: {
      invalid: "Jumlah tidak terbaca. Coba 15jt, 15.000.000 atau 15,000,000.",
      empty: "Masukkan gaji bulananmu.",
      min: `Gaji minimal Rp${MIN_MONTHLY_IDR.toLocaleString("id-ID")} per bulan.`,
    },
    keptLast: (amount: string) => `Menampilkan nilai valid terakhir: ${amount}.`,
    note: "Hanya indikatif. Angka pasar belum bersumber dan masih ditinjau; konversi rupiah memakai kurs tetap Rp15.500 per USD.",
  },
} as const;

type ErrorKey = keyof (typeof copy)["en"]["errors"];

const DEFAULT_COUNTRIES = ["Singapore"];

function formatMoney(value: number, currency: CurrencyCode, language: LanguageCode) {
  const number = Math.round(value).toLocaleString(language === "id" ? "id-ID" : "en-US");
  return currency === "USD" ? `$${number}` : `Rp ${number}`;
}

function formatRatio(value: number, language: LanguageCode) {
  return `${value.toLocaleString(language === "id" ? "id-ID" : "en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}×`;
}

interface SalaryCalculatorProps {
  data: SalaryEntry[];
  currency: CurrencyCode;
  cadence: Cadence;
  language: LanguageCode;
  exchangeRate: number;
}

const SalaryCalculator = ({
  data,
  currency,
  cadence,
  language,
  exchangeRate,
}: SalaryCalculatorProps) => {
  const t = copy[language];
  const levelLabels = getSeniorityLabels(language);
  const markets = useMemo(
    () => data.filter((entry) => entry.country !== "Indonesia").map((e) => e.country),
    [data],
  );

  const [text, setText] = useState("");
  const [valid, setValid] = useState<number | null>(null);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [level, setLevel] = useState<SeniorityKey>("middle");
  const [picks, setPicks] = useState<string[]>(DEFAULT_COUNTRIES);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(SALARY_KEY));
      const parsed = parseSalary(String(saved));
      if (parsed.ok) {
        setValid(parsed.value);
        setText(String(parsed.value));
      }
      const rawPicks = localStorage.getItem(COUNTRIES_KEY);
      if (rawPicks) {
        const list: unknown = JSON.parse(rawPicks);
        if (Array.isArray(list)) {
          setPicks(
            list
              .filter((c): c is string => typeof c === "string" && markets.includes(c))
              .slice(0, MAX_MARKETS),
          );
        }
      }
    } catch {
      /* storage unavailable or corrupt: keep defaults */
    }
  }, [markets]);

  const persist = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  };

  const onSalaryChange = (next: string) => {
    setText(next);
    if (next.trim() === "") {
      setError("empty");
      return;
    }
    const parsed = parseSalary(next);
    if (parsed.ok) {
      setError(null);
      setValid(parsed.value);
      persist(SALARY_KEY, String(parsed.value));
    } else {
      setError(parsed.error);
    }
  };

  const onPick = (index: number, country: string) => {
    const next = [...picks];
    if (country) next[index] = country;
    else next.splice(index, 1);
    const unique = next.filter((c, i) => c && next.indexOf(c) === i).slice(0, MAX_MARKETS);
    setPicks(unique);
    persist(COUNTRIES_KEY, JSON.stringify(unique));
  };

  const rows = useMemo(() => {
    if (valid === null) return [];
    const yours = convertSalary((valid * 12) / exchangeRate, currency, cadence, exchangeRate);
    return picks
      .map((country) => data.find((entry) => entry.country === country))
      .filter((entry): entry is SalaryEntry => Boolean(entry))
      .map((entry) => {
        const figure = convertSalary(entry[level], currency, cadence, exchangeRate);
        return { country: entry.country, figure, ratio: figure / yours };
      });
  }, [cadence, currency, data, exchangeRate, level, picks, valid]);

  const yours =
    valid === null
      ? null
      : convertSalary((valid * 12) / exchangeRate, currency, cadence, exchangeRate);
  const cadenceLabel = getCadenceLabel(language, cadence);
  const slots = Math.min(picks.length + 1, MAX_MARKETS);

  return (
    <section className="calculator" aria-labelledby="calculator-title">
      <div className="section-title">
        <h2 id="calculator-title">{t.title}</h2>
        <p>{t.description}</p>
      </div>

      <div className="calc-form">
        <div className="filter-group calc-salary">
          <label htmlFor="salary-input">{t.salaryLabel}</label>
          <input
            id="salary-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder={t.placeholder}
            value={text}
            aria-invalid={error !== null}
            aria-describedby="salary-feedback"
            onChange={(event) => onSalaryChange(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="level-select">{t.levelLabel}</label>
          <select
            id="level-select"
            value={level}
            onChange={(event) => setLevel(event.target.value as SeniorityKey)}
          >
            {LEVELS.map((key) => (
              <option key={key} value={key}>
                {levelLabels[key]}
              </option>
            ))}
          </select>
        </div>
        {Array.from({ length: slots }, (_, index) => (
          <div className="filter-group" key={index}>
            <label htmlFor={`market-select-${index}`}>{t.marketLabel(index + 1)}</label>
            <select
              id={`market-select-${index}`}
              value={picks[index] ?? ""}
              onChange={(event) => onPick(index, event.target.value)}
            >
              <option value="">{t.none}</option>
              {markets
                .filter((c) => c === picks[index] || !picks.includes(c))
                .map((country) => (
                  <option key={country} value={country}>
                    {getCountryWithFlag(country)}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>

      <div id="salary-feedback" aria-live="polite">
        {error && (
          <p className="calc-error" role="alert">
            {t.errors[error]}
            {valid !== null && ` ${t.keptLast(formatMoney(valid, "IDR", language))}`}
          </p>
        )}
        {valid !== null && (
          <p className="calc-parsed">{t.parsed(formatMoney(valid, "IDR", language))}</p>
        )}
      </div>

      {valid === null ? (
        !error && <p>{t.emptyResult}</p>
      ) : rows.length === 0 ? (
        <p>{t.noMarkets}</p>
      ) : (
        <div className="comparison-summary calc-results">
          <div className="summary-card summary-card--negative">
            <strong>{t.yours}</strong>
            <span>{formatMoney(yours ?? 0, currency, language)}</span>
            <p>
              {cadenceLabel} {currency}
            </p>
          </div>
          {rows.map((row) => (
            <div key={row.country} className="summary-card summary-card--positive">
              <strong>
                {getCountryWithFlag(row.country)} · {levelLabels[level]}
              </strong>
              <span>{formatMoney(row.figure, currency, language)}</span>
              <p>
                {cadenceLabel} {currency} · {t.ratio} {formatRatio(row.ratio, language)}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className="calc-note">{t.note}</p>
    </section>
  );
};

export default SalaryCalculator;
