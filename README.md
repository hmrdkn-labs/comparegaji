# CompareGaji

**Live Demo:** [https://comparegaji.pages.dev/](https://comparegaji.pages.dev/)

An Astro site with React islands that visualises Indonesia's tech salary benchmarks against 24 global markets. The bilingual (English/Bahasa Indonesia) experience includes interactive controls and data visualizations optimized for desktop and mobile devices.

## ✨ Key Features

- **🌍 Multi-currency & cadence support**: Switch between USD/IDR and annual/monthly in real-time
- **🌐 Bilingual interface**: Full English and Bahasa Indonesia translations
- **🎌 Country flags**: Visual country identification with Unicode flag emojis
- **📊 Interactive charts**: 
  - Multi-country line chart with band/country toggle modes
  - Color-coded salary bands with shaded min/max ranges
  - Indonesia vs. any country bar comparison with percentage deltas
- **📱 Mobile-optimized**: Touch-friendly controls with 44px minimum tap targets
- **📥 Data export**: Sortable, filterable table with CSV download

## Tech Stack

- [Astro](https://astro.build/) with the Cloudflare adapter
- React islands powered by [`@astrojs/react`](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Recharts](https://recharts.org/) for both the line and bar visualisations

## Project Layout

```
src/
  components/
    islands/
      SalaryExplorer.tsx
      CountryComparisonChart.tsx
      MultiCountryLineChart.tsx
      SalaryTable.tsx
  data/
    salaryData.ts        // static benchmark dataset
  layouts/
    Layout.astro         // global shell, typography, palette variables
  pages/
    index.astro          // renders the SalaryExplorer island within the global layout
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

### Adding More Countries

To add more countries, append entries to `src/data/salaryData.ts`:

```typescript
{
  country: "Brazil",
  band: "Middle Band",
  junior: 35000,
  middle: 52000,
  senior: 78000,
  juniorRatio: 2.5,
  seniorRatio: 3.1
}
```

Don't forget to add the corresponding flag emoji in `src/utils/salary.ts`:

```typescript
export const countryFlags: Record<string, string> = {
  // ... existing flags
  "Brazil": "🇧🇷",
};
```

### Customization

- **Regional grouping**: Add grouping logic in `src/utils/salary.ts` and pass into the islands
- **Chart library**: If swapping Recharts, keep components under `src/components/islands/` to preserve Astro's island architecture
- **Styling**: Modify design tokens in `src/styles/global.css` (CSS custom properties for colors, shadows, etc.)
- **Translations**: Extend translation objects in `SalaryExplorer.tsx` for additional languages

## Data Sources

The salary data represents tech industry benchmarks as of 2024. Data should be periodically updated to reflect current market conditions.

## Deployment

This project is deployed on **Cloudflare Pages**:

1. Push to your repository
2. Connect to Cloudflare Pages
3. Build command: `npm run build`
4. Output directory: `dist`

The site automatically deploys on push to the main branch.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests for:
- Updated salary data
- Additional countries
- UI/UX improvements
- Bug fixes
- Translation corrections
