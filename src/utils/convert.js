/**
 * Convert an annual amount between currencies using USD-based rates
 * (units per 1 USD, as in src/data/fx.json), then apply the cadence.
 *
 * @param {number} annualAmount amount per year in `from`
 * @param {string} from ISO 4217 code of `annualAmount`
 * @param {string} to ISO 4217 code to display
 * @param {"annual" | "monthly"} cadence
 * @param {Record<string, number>} rates units per 1 USD
 */
export function convertAnnual(annualAmount, from, to, cadence, rates) {
  const rateOf = (code) => {
    const rate = rates[code];
    if (!(rate > 0)) throw new Error(`fx: no rate for ${code}`);
    return rate;
  };
  const amount = (annualAmount / rateOf(from)) * rateOf(to);
  return cadence === "monthly" ? amount / 12 : amount;
}
