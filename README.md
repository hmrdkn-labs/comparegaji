# ID Career Compare

An Astro site with React islands that visualise Indonesia&apos;s product salary benchmarks against key global markets. The experience focuses on three interactive sections:

- multi-country line chart that tracks salary growth across junior, middle, and senior roles
- Indonesia vs. single-market bar comparison with percentage deltas
- sortable, filterable data table with CSV export for deeper analysis

## Tech Stack

- [Astro](https://astro.build/) with the Cloudflare adapter
- React islands powered by [`@astrojs/react`](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Recharts](https://recharts.org/) for both the line and bar visualisations

## Project Layout

```
src/
  components/
    islands/
      CountryComparisonChart.tsx
      MultiCountryLineChart.tsx
      SalaryTable.tsx
  data/
    salaryData.ts        // static benchmark dataset
  layouts/
    Layout.astro         // global shell, typography, palette variables
  pages/
    index.astro          // main page composed of the interactive sections
  styles/
    global.css           // shared tokens and component-level styling
```

The dataset lives in `src/data/salaryData.ts` as a typed array of `SalaryEntry`, making it easy to extend or replace with updated figures.

## Local Development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`. React islands mount on the client, so make sure client-side errors surface cleanly in your console while iterating.

### Build & Deploy

- `npm run build` – generates the static build
- `npm run preview` – runs the built output locally via `wrangler dev`
- `npm run deploy` – bundles and deploys to Cloudflare Workers (requires credentials)

## Extending The Experience

- To add more countries, append entries to `salaryData.ts`. The charts and table react automatically.
- Additional grouping logic (e.g. by region) can be added in `src/utils/salary.ts` and passed into the islands.
- If you swap Recharts for another library, keep the components under `src/components/islands/` to preserve Astro&apos;s island architecture.
