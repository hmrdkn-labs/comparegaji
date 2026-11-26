import { fxSnapshot, formatNumber, type LanguageCode, type SeniorityKey } from "../../utils/salary";
import { getSource, levelBasis, sources, type MarketFigure } from "../../data/sources";

export const noFigure: Record<LanguageCode, string> = {
  en: "no sourced figure for this level (fewer than 100 responses)",
  id: "tidak ada angka bersumber untuk level ini (kurang dari 100 responden)",
};

export function sourceLabel(
  market: MarketFigure,
  level: SeniorityKey,
  language: LanguageCode,
): string | null {
  const figure = market.levels[level];
  if (!figure) return null;
  const source = getSource(market.sourceId);
  const prefix = language === "id" ? "Sumber" : "Source";
  return `${prefix}: ${source.publisher} ${source.title}, ${market.period}, n = ${figure.n}`;
}

export function shortSourceLabel(market: MarketFigure, level: SeniorityKey): string | null {
  const figure = market.levels[level];
  if (!figure) return null;
  return `${getSource(market.sourceId).shortLabel}, n = ${figure.n}`;
}

export function tableCaption(language: LanguageCode): string {
  const prefix = language === "id" ? "Sumber" : "Source";
  return sources.map((source) => `${prefix}: ${source.caption}`).join("; ");
}

export const noFigureShort: Record<LanguageCode, string> = {
  en: "no sourced figure (fewer than 100 responses)",
  id: "tidak ada angka bersumber (kurang dari 100 responden)",
};

export function fxLabel(language: LanguageCode): string {
  const rate = formatNumber(fxSnapshot.rates.IDR, language, 2).replace(/[.,]00$/, "");
  if (language === "id") {
    return `Rp ${rate} per USD, ${fxSnapshot.date}, kurs referensi bank sentral (via Frankfurter), indikatif, bukan penawaran`;
  }
  return `Rp ${rate} per USD, ${fxSnapshot.date}, ${fxSnapshot.provider} (via Frankfurter), indicative, not an offer`;
}

export function levelBasisLabel(language: LanguageCode): string {
  return levelBasis[language];
}

export const userFigureLabel: Record<LanguageCode, string> = {
  en: "Your own input, converted at the rate above",
  id: "Masukan Anda sendiri, dikonversi dengan kurs di atas",
};
