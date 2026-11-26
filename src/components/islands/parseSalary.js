export const MIN_MONTHLY_IDR = 100000;

/**
 * Parse a monthly rupiah amount typed by a person.
 * Accepts 15000000, 15.000.000, 15,000,000, 15jt, 15 jt, 1,5 jt, 1.5jt, Rp 15 juta, 15 juta.
 * With a jt/juta suffix a single . or , is a decimal mark; without one it is a thousands mark.
 *
 * @param {string} input
 * @returns {{ ok: true, value: number } | { ok: false, error: "invalid" | "min" }}
 */
export function parseSalary(input) {
  const text = String(input ?? "")
    .toLowerCase()
    .replace(/^\s*rp\.?/, "")
    .replace(/\s+/g, "");

  let value = NaN;
  const million = text.match(/^(\d+(?:[.,]\d+)?)(?:jt|juta)$/);
  if (million) {
    value = Math.round(Number(million[1].replace(",", ".")) * 1_000_000);
  } else if (/^\d{1,3}(?:[.,]\d{3})+$/.test(text)) {
    value = Number(text.replace(/[.,]/g, ""));
  } else if (/^\d+$/.test(text)) {
    value = Number(text);
  }

  if (!Number.isFinite(value)) return { ok: false, error: "invalid" };
  if (value < MIN_MONTHLY_IDR) return { ok: false, error: "min" };
  return { ok: true, value };
}
