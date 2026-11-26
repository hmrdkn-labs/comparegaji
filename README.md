# CompareGaji

**Live Demo:** [https://comparegaji.pages.dev/](https://comparegaji.pages.dev/)

An Astro site with React islands. Enter your rupiah salary and compare it with the same level in other markets; charts and a table show the underlying benchmarks. The bilingual (English/Bahasa Indonesia) experience includes interactive controls and data visualizations optimized for desktop and mobile devices.

## Features

- Rupiah salary in, same level abroad out: type `15jt`, `15.000.000` or `Rp 15 juta`, pick a level and up to three markets.
- USD/IDR and annual/monthly toggles apply to every figure.
- Every figure shows its source, period and sample size; the rupiah rate shows its date.
- English and Bahasa Indonesia.
- Sortable table of the sourced medians, with a CSV download (UTF-8 BOM, source line, units in the header).

## Tech Stack

- [Astro](https://astro.build/), static output, no adapter
- React islands powered by [`@astrojs/react`](https://docs.astro.build/en/guides/integrations-guide/react/)

## Project Layout

```
src/
  components/islands/
    SalaryExplorer.tsx     // toggles, calculator, table, footer
    SalaryCalculator.tsx   // rupiah salary vs same level abroad
    SalaryTable.tsx        // sourced medians, sortable
    parseSalary.js         // pure input parser (15jt, 15.000.000, ...)
    labels.ts, csv.ts      // source/FX labels, CSV builder
  data/
    sources.ts             // source ledger + sourced figures (validated at build)
    fx.json                // dated FX snapshot (written by scripts/fx-snapshot.mjs)
    LICENSE-DATA           // ODbL notice for the data
  utils/
    salary.ts, convert.js  // formatting, currency conversion
scripts/
  fx-snapshot.mjs          // prebuild: fetch FX from Frankfurter
  test-parse.mjs, test-convert.mjs
```

## Local Development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`. React islands mount on the client, so make sure client-side errors surface cleanly in your console while iterating.

### Build & Deploy

- `npm run build` – generates the static build
- `npm run preview` – serves the built output locally with `astro preview`
- `npm run deploy` – builds, then runs `wrangler pages deploy dist` (manual; needs Cloudflare credentials)
- `node scripts/test-parse.mjs` – tests the salary input parser
- `node scripts/test-convert.mjs` – tests the currency conversion against `fx.json`

## Data Sources

Only figures with a named, dated, reusable source are shown. On 2026-11-26 the earlier figures were removed: they had no source record, and neither did the "Indonesia benchmark", the band groupings, or the summary cards.

- **What is shown:** for 13 markets (India, Brazil, Spain, Czech Rep., Poland, Germany, Australia, France, Canada, United Kingdom, Netherlands, Switzerland, United States), the median gross annual total compensation (salary, bonuses, perks, before tax) of employed professional developers, in USD per year, at up to three levels. The Indonesian side is the number you type; the site holds no Indonesian figures.
- **Source:** [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/) microdata (`results.csv`), fielded 2025-05-29 to 2025-06-23, ODbL 1.0. Stack Overflow converted salaries to USD at the 2025-06-25 rate (`ConvertedCompYearly`). Respondents skew toward engaged Stack Overflow users; this is not a random sample of national developers.
- **Level rule:** years of professional work experience (`WorkExp`): junior 0–2, middle 3–7, senior 8+. A level needs at least 100 responses; otherwise the site says "no sourced figure for this level". Respondents with a blank `WorkExp` are excluded. Medians are of raw self-reported values, without outlier trimming.
- **Markets dropped:** 11 of the 24 markets earlier shown (Egypt, Philippines, Vietnam, Malaysia, Argentina, Japan, Mexico, Taiwan, South Korea, Ireland, Singapore) have no level with 100 responses and no source with a usable licence.
- **FX:** `scripts/fx-snapshot.mjs` fetches [Frankfurter](https://frankfurter.dev/) (USD base) before every build and writes `src/data/fx.json` with its date. If the fetch fails the committed snapshot is kept. The page shows "Rp X per USD, <date>, indicative, not an offer". Rupiah figures are conversions of the USD medians at that rate.
- **Ledger:** `src/data/sources.ts` holds each source and market. The build throws when a market lacks a resolvable `sourceId`, period, currency or licence.

## Licence

- **Code:** MIT, see [`LICENSE`](LICENSE).
- **Data:** ODbL 1.0, see [`src/data/LICENSE-DATA`](src/data/LICENSE-DATA). It covers `src/data/sources.ts`, `src/data/*.json` and the CSV export.
- **Third-party attribution:** Data: Stack Overflow Developer Survey 2025, ODbL 1.0 (https://survey.stackoverflow.co/2025/). Exchange rates: Frankfurter (https://frankfurter.dev/).
