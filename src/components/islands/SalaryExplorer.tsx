import { useEffect, useState } from "react";
import { sources, type MarketFigure } from "../../data/sources";
import type { Cadence, CurrencyCode, LanguageCode } from "../../utils/salary";
import SalaryTable from "./SalaryTable";
import SalaryCalculator from "./SalaryCalculator";

interface TranslationShape {
  heroTitle: string;
  heroDescription: (markets: number) => string;
  controls: { currency: string; cadence: string; language: string };
  toggles: {
    usd: string;
    idr: string;
    annual: string;
    monthly: string;
    english: string;
    indonesian: string;
  };
  table: {
    title: string;
    description: string;
    copy: {
      downloadLabel: string;
      csvNote: string;
      columns: { country: string; junior: string; middle: string; senior: string };
    };
  };
  footer: { licences: string; fx: string };
}

const translations: Record<LanguageCode, TranslationShape> = {
  en: {
    heroTitle: "Your rupiah salary against the same level abroad.",
    heroDescription: (markets) =>
      `Type your monthly salary in rupiah and see what the same experience level earns in ${markets} other markets. Every figure carries its source, period and sample size.`,
    controls: { currency: "Currency", cadence: "Cadence", language: "Language" },
    toggles: {
      usd: "USD",
      idr: "IDR",
      annual: "Annual",
      monthly: "Monthly",
      english: "English",
      indonesian: "Bahasa",
    },
    table: {
      title: "Sourced medians by market",
      description:
        "Median gross annual total compensation of employed professional developers. A level is empty when the survey has fewer than 100 responses for it.",
      copy: {
        downloadLabel: "Download CSV",
        csvNote: "The CSV holds the original survey figures (USD per year).",
        columns: { country: "Country", junior: "Junior", middle: "Middle", senior: "Senior" },
      },
    },
    footer: {
      licences: "Code MIT · Data ODbL",
      fx: "FX: Frankfurter",
    },
  },
  id: {
    heroTitle: "Gaji rupiahmu dibanding level yang sama di luar negeri.",
    heroDescription: (markets) =>
      `Ketik gaji bulananmu dalam rupiah dan lihat berapa penghasilan level pengalaman yang sama di ${markets} pasar lain. Setiap angka disertai sumber, periode, dan jumlah responden.`,
    controls: { currency: "Mata uang", cadence: "Periode", language: "Bahasa" },
    toggles: {
      usd: "USD",
      idr: "IDR",
      annual: "Tahunan",
      monthly: "Bulanan",
      english: "Inggris",
      indonesian: "Indonesia",
    },
    table: {
      title: "Median bersumber per pasar",
      description:
        "Median total kompensasi kotor tahunan pengembang profesional yang bekerja. Level dikosongkan bila survei punya kurang dari 100 responden untuk level itu.",
      copy: {
        downloadLabel: "Unduh CSV",
        csvNote: "CSV berisi angka survei asli (USD per tahun).",
        columns: { country: "Negara", junior: "Junior", middle: "Menengah", senior: "Senior" },
      },
    },
    footer: {
      licences: "Kode MIT · Data ODbL",
      fx: "Kurs: Frankfurter",
    },
  },
};

interface SalaryExplorerProps {
  data: MarketFigure[];
}

const SalaryExplorer = ({ data }: SalaryExplorerProps) => {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [cadence, setCadence] = useState<Cadence>("annual");
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <>
      <section className="hero-card">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroDescription(data.length)}</p>

        <div className="filter-row hero-controls" role="group" aria-label="View settings">
          <div className="filter-group">
            <label>{t.controls.currency}</label>
            <div className="view-toggle" role="group" aria-label={t.controls.currency}>
              <button type="button" aria-pressed={currency === "USD"} onClick={() => setCurrency("USD")}>
                {t.toggles.usd}
              </button>
              <button type="button" aria-pressed={currency === "IDR"} onClick={() => setCurrency("IDR")}>
                {t.toggles.idr}
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label>{t.controls.cadence}</label>
            <div className="view-toggle" role="group" aria-label={t.controls.cadence}>
              <button type="button" aria-pressed={cadence === "annual"} onClick={() => setCadence("annual")}>
                {t.toggles.annual}
              </button>
              <button type="button" aria-pressed={cadence === "monthly"} onClick={() => setCadence("monthly")}>
                {t.toggles.monthly}
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label>{t.controls.language}</label>
            <div className="view-toggle" role="group" aria-label={t.controls.language}>
              <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>
                {t.toggles.english}
              </button>
              <button type="button" aria-pressed={language === "id"} onClick={() => setLanguage("id")}>
                {t.toggles.indonesian}
              </button>
            </div>
          </div>
        </div>
      </section>

      <SalaryCalculator data={data} currency={currency} cadence={cadence} language={language} />

      <section id="table-section">
        <div className="section-title">
          <h2>{t.table.title}</h2>
          <p>{t.table.description}</p>
        </div>
        <SalaryTable
          data={data}
          currency={currency}
          cadence={cadence}
          language={language}
          copy={t.table.copy}
        />
      </section>

      <footer className="site-footer">
        {sources.map((source) => (
          <span key={source.id}>
            <a href={source.url}>{source.attribution}</a> ·{" "}
          </span>
        ))}
        <a href="https://frankfurter.dev/">{t.footer.fx}</a> · {t.footer.licences}
      </footer>
    </>
  );
};

export default SalaryExplorer;
