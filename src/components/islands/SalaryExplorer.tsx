import { useMemo, useState } from "react";
import type { SalaryEntry } from "../../data/salaryData";
import {
  USD_TO_IDR,
  convertSalary,
  currencyLabels,
  formatCurrency,
  getCadenceLabel,
  getSeniorityLabels,
  type Cadence,
  type CurrencyCode,
  type LanguageCode,
} from "../../utils/salary";
import MultiCountryLineChart from "./MultiCountryLineChart";
import CountryComparisonChart from "./CountryComparisonChart";
import SalaryTable from "./SalaryTable";

interface TranslationShape {
  heroTitle: string;
  heroDescription: string;
  controls: {
    currency: string;
    cadence: string;
    language: string;
  };
  toggles: {
    usd: string;
    idr: string;
    annual: string;
    monthly: string;
    english: string;
    indonesian: string;
  };
  summary: {
    marketsLabel: string;
    marketsDescription: string;
    topSeniorLabel: string;
    topSeniorSuffix: (country?: string) => string;
    topSeniorDescription: (cadence: string, currency: string) => string;
    indonesiaLabel: string;
    indonesiaDescription: (cadence: string, currency: string) => string;
  };
  lineChart: {
    title: string;
    description: string;
    copy: {
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
    };
  };
  comparison: {
    title: string;
    descriptionTemplate: string;
    copy: {
      title: string;
      description: string;
      selectLabel: string;
      optionSeparator: string;
      noData: string;
      summaryLabels: {
        senior: string;
        middle: string;
        junior: string;
      };
      evenLabel: string;
      notApplicable: string;
    };
  };
  table: {
    title: string;
    description: string;
    copy: {
      bandLabel: string;
      downloadLabel: string;
      allLabel: string;
      noResults: string;
      columns: {
        country: string;
        band: string;
        junior: string;
        middle: string;
        senior: string;
        juniorRatio: string;
        seniorRatio: string;
      };
    };
  };
}

const translations: Record<LanguageCode, TranslationShape> = {
  en: {
    heroTitle: "Indonesia's product salary position, at a glance.",
    heroDescription:
      "Track how Indonesia's salary benchmarks compare to digital product markets across the globe. Switch currency, cadence, and language to explore interactive comparisons below.",
    controls: {
      currency: "Currency",
      cadence: "Cadence",
      language: "Language",
    },
    toggles: {
      usd: "USD",
      idr: "IDR",
      annual: "Annual",
      monthly: "Monthly",
      english: "English",
      indonesian: "Bahasa",
    },
    summary: {
      marketsLabel: "Benchmarked markets",
      marketsDescription: "Countries included",
      topSeniorLabel: "Top senior salary",
      topSeniorSuffix: (country) => (country ? ` · ${country}` : ""),
      topSeniorDescription: (cadence, currency) => `${cadence} ${currency}`,
      indonesiaLabel: "Indonesia senior benchmark",
      indonesiaDescription: (cadence, currency) => `${cadence} ${currency}`,
    },
    lineChart: {
      title: "Growth across seniority",
      description:
        "Compare how salaries scale from junior to senior roles. Toggle between individual markets or averaged band groupings to understand which ecosystems accelerate faster.",
      copy: {
        title: "How salaries scale with seniority",
        description:
          "Visualise how compensation grows from junior to senior roles. Compare individual nations or look at averages by band classification.",
        countriesLabel: "Countries",
        bandsLabel: "Bands",
        bandFilterLabel: "Band filter",
        bandHelper: "Benchmark (Indonesia) is always shown. Pick a country in this band to compare.",
        emptyState: "No countries available for the selected band.",
        footnoteCountries: "Salary values shown in %currency% (%cadence%).",
        footnoteBands: "Benchmark line (Indonesia) plus minimum and maximum lines are shown in %currency% (%cadence%).",
        rangeLabels: {
          min: "%band% minimum",
          max: "%band% maximum",
        },
        compareLabel: "Compare a country",
        comparePlaceholder: "Optional country in this band",
        benchmarkLabel: "Benchmark (Indonesia)",
      },
    },
    comparison: {
      title: "Indonesia vs. the world",
      descriptionTemplate:
        "Select a country to see how Indonesia's salary benchmarks stack up in %currency% (%cadence%).",
      copy: {
        title: "Indonesia vs. a target market",
        description: "",
        selectLabel: "Compare with",
        optionSeparator: " - ",
        noData: "We need at least one other country to run a side-by-side comparison.",
        summaryLabels: {
          senior: "Senior gap",
          middle: "Mid-level gap",
          junior: "Junior gap",
        },
        evenLabel: "Even",
        notApplicable: "N/A",
      },
    },
    table: {
      title: "Inspect the dataset",
      description:
        "Sort and filter the reference table to explore each country's benchmark. Export the view in your current currency and cadence for further analysis.",
      copy: {
        bandLabel: "Band",
        downloadLabel: "Download CSV",
        allLabel: "All",
        noResults: "No records for the selected band.",
        columns: {
          country: "Country",
          band: "Band",
          junior: "Junior",
          middle: "Middle",
          senior: "Senior",
          juniorRatio: "Junior ratio",
          seniorRatio: "Senior ratio",
        },
      },
    },
  },
  id: {
    heroTitle: "Posisi gaji produk Indonesia secara ringkas.",
    heroDescription:
      "Lihat bagaimana patokan gaji Indonesia dibanding pasar produk digital global. Ubah mata uang, periode, dan bahasa untuk menjelajah data interaktif.",
    controls: {
      currency: "Mata uang",
      cadence: "Periode",
      language: "Bahasa",
    },
    toggles: {
      usd: "USD",
      idr: "IDR",
      annual: "Tahunan",
      monthly: "Bulanan",
      english: "Inggris",
      indonesian: "Indonesia",
    },
    summary: {
      marketsLabel: "Jumlah pasar",
      marketsDescription: "Total negara",
      topSeniorLabel: "Gaji senior tertinggi",
      topSeniorSuffix: (country) => (country ? ` · ${country}` : ""),
      topSeniorDescription: (cadence, currency) => `${cadence} ${currency}`,
      indonesiaLabel: "Patokan senior Indonesia",
      indonesiaDescription: (cadence, currency) => `${cadence} ${currency}`,
    },
    lineChart: {
      title: "Pertumbuhan menurut senioritas",
      description:
        "Bandingkan perkembangan gaji dari level junior sampai senior. Beralih antara perbandingan negara atau rata-rata tiap band untuk melihat ekosistem mana yang naik lebih cepat.",
      copy: {
        title: "Perkembangan gaji per level",
        description:
          "Lihat bagaimana kompensasi meningkat dari junior ke senior. Bandingkan negara secara langsung atau gunakan rata-rata band untuk perspektif kelompok.",
        countriesLabel: "Negara",
        bandsLabel: "Band",
        bandFilterLabel: "Filter band",
        bandHelper: "Benchmark (Indonesia) selalu tampil. Pilih negara di band ini untuk dibandingkan.",
        emptyState: "Tidak ada negara untuk band yang dipilih.",
        footnoteCountries: "Seluruh nilai dalam %currency% (%cadence%).",
        footnoteBands: "Garis benchmark (Indonesia) beserta batas bawah dan atas band ditampilkan dalam %currency% (%cadence%).",
        rangeLabels: {
          min: "%band% terendah",
          max: "%band% tertinggi",
        },
        compareLabel: "Bandingkan negara",
        comparePlaceholder: "Negara opsional dalam band ini",
        benchmarkLabel: "Benchmark (Indonesia)",
      },
    },
    comparison: {
      title: "Indonesia vs. pasar tujuan",
      descriptionTemplate:
        "Pilih negara untuk membandingkan patokan gaji Indonesia dalam %currency% (%cadence%).",
      copy: {
        title: "Perbandingan dengan pasar lain",
        description: "",
        selectLabel: "Bandingkan dengan",
        optionSeparator: " · ",
        noData: "Perlu minimal satu negara lain untuk perbandingan berdampingan.",
        summaryLabels: {
          senior: "Selisih senior",
          middle: "Selisih menengah",
          junior: "Selisih junior",
        },
        evenLabel: "Seimbang",
        notApplicable: "Tidak ada data",
      },
    },
    table: {
      title: "Periksa dataset",
      description:
        "Urutkan dan saring tabel referensi untuk melihat patokan setiap negara. Ekspor tampilan sesuai mata uang dan periode pilihan Anda.",
      copy: {
        bandLabel: "Band",
        downloadLabel: "Unduh CSV",
        allLabel: "Semua",
        noResults: "Tidak ada data untuk band ini.",
        columns: {
          country: "Negara",
          band: "Band",
          junior: "Junior",
          middle: "Menengah",
          senior: "Senior",
          juniorRatio: "Rasio junior",
          seniorRatio: "Rasio senior",
        },
      },
    },
  },
};

interface SalaryExplorerProps {
  data: SalaryEntry[];
  exchangeRate?: number;
}

const SalaryExplorer = ({ data, exchangeRate = USD_TO_IDR }: SalaryExplorerProps) => {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [cadence, setCadence] = useState<Cadence>("annual");
  const [language, setLanguage] = useState<LanguageCode>("en");

  const t = translations[language];
  const seniorityLabels = getSeniorityLabels(language);
  const cadenceLabel = getCadenceLabel(language, cadence);
  const currencyLabel = currencyLabels[currency];

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
        label: t.summary.marketsLabel,
        value: `${data.length}`,
        tone: "hero" as const,
        description: t.summary.marketsDescription,
      },
      {
        label: `${t.summary.topSeniorLabel}${t.summary.topSeniorSuffix(topSenior?.country)}`,
        value: formatCurrency(topSeniorValue, currency),
        tone: "positive" as const,
        description: t.summary.topSeniorDescription(cadenceLabel, currencyLabel),
      },
      {
        label: t.summary.indonesiaLabel,
        value: formatCurrency(indonesiaSeniorValue, currency),
        tone: "negative" as const,
        description: t.summary.indonesiaDescription(cadenceLabel, currencyLabel),
      },
    ];
  }, [
    cadence,
    cadenceLabel,
    currency,
    currencyLabel,
    data.length,
    exchangeRate,
    indonesia?.senior,
    t.summary,
    topSenior?.country,
    topSenior?.senior,
  ]);

  const lineChartCopy = useMemo(() => {
    return {
      title: t.lineChart.copy.title,
      description: t.lineChart.copy.description,
      countriesLabel: t.lineChart.copy.countriesLabel,
      bandsLabel: t.lineChart.copy.bandsLabel,
      bandFilterLabel: t.lineChart.copy.bandFilterLabel,
      bandHelper: t.lineChart.copy.bandHelper,
      emptyState: t.lineChart.copy.emptyState,
      footnoteCountries: t.lineChart.copy.footnoteCountries,
      footnoteBands: t.lineChart.copy.footnoteBands,
      rangeLabels: t.lineChart.copy.rangeLabels,
      compareLabel: t.lineChart.copy.compareLabel,
      comparePlaceholder: t.lineChart.copy.comparePlaceholder,
      benchmarkLabel: t.lineChart.copy.benchmarkLabel,
    };
  }, [t.lineChart.copy]);

  const comparisonDescription = useMemo(() => {
    return t.comparison.descriptionTemplate
      .replace("%currency%", currencyLabel)
      .replace("%cadence%", cadenceLabel.toLowerCase());
  }, [cadenceLabel, currencyLabel, t.comparison.descriptionTemplate]);

  const comparisonCopy = useMemo(() => {
    return {
      title: t.comparison.copy.title,
      description: comparisonDescription,
      selectLabel: t.comparison.copy.selectLabel,
      optionSeparator: t.comparison.copy.optionSeparator,
      noData: t.comparison.copy.noData,
      summaryLabels: t.comparison.copy.summaryLabels,
      evenLabel: t.comparison.copy.evenLabel,
      notApplicable: t.comparison.copy.notApplicable,
    };
  }, [comparisonDescription, t.comparison.copy]);

  const tableCopy = useMemo(() => t.table.copy, [t.table.copy]);

  return (
    <>
      <section className="hero-card">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroDescription}</p>

        <div className="filter-row hero-controls" role="group" aria-label="View settings">
          <div className="filter-group">
            <label>{t.controls.currency}</label>
            <div className="view-toggle" role="group" aria-label={t.controls.currency}>
              <button
                type="button"
                aria-pressed={currency === "USD"}
                onClick={() => setCurrency("USD")}
              >
                {t.toggles.usd}
              </button>
              <button
                type="button"
                aria-pressed={currency === "IDR"}
                onClick={() => setCurrency("IDR")}
              >
                {t.toggles.idr}
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label>{t.controls.cadence}</label>
            <div className="view-toggle" role="group" aria-label={t.controls.cadence}>
              <button
                type="button"
                aria-pressed={cadence === "annual"}
                onClick={() => setCadence("annual")}
              >
                {t.toggles.annual}
              </button>
              <button
                type="button"
                aria-pressed={cadence === "monthly"}
                onClick={() => setCadence("monthly")}
              >
                {t.toggles.monthly}
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label>{t.controls.language}</label>
            <div className="view-toggle" role="group" aria-label={t.controls.language}>
              <button
                type="button"
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
              >
                {t.toggles.english}
              </button>
              <button
                type="button"
                aria-pressed={language === "id"}
                onClick={() => setLanguage("id")}
              >
                {t.toggles.indonesian}
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
          <h2>{t.lineChart.title}</h2>
          <p>{t.lineChart.description}</p>
        </div>
        <MultiCountryLineChart
          data={data}
          currency={currency}
          cadence={cadence}
          language={language}
          seniorityLabels={seniorityLabels}
          copy={lineChartCopy}
          exchangeRate={exchangeRate}
        />
      </section>

      <section>
        <div className="section-title">
          <h2>{t.comparison.title}</h2>
          <p>{comparisonDescription}</p>
        </div>
        <CountryComparisonChart
          data={data}
          currency={currency}
          cadence={cadence}
          seniorityLabels={seniorityLabels}
          copy={comparisonCopy}
          exchangeRate={exchangeRate}
        />
      </section>

      <section>
        <div className="section-title">
          <h2>{t.table.title}</h2>
          <p>{t.table.description}</p>
        </div>
        <SalaryTable
          data={data}
          currency={currency}
          cadence={cadence}
          language={language}
          copy={tableCopy}
          exchangeRate={exchangeRate}
        />
      </section>
    </>
  );
};

export default SalaryExplorer;
