## Predictive Analytics Dashboard — Final Build Plan

Client-side analytics app: upload CSV → clean → train regression / time-series → visualize forecasts. 100% in-browser, no backend.

Built on this project's TanStack Start + Vite + React + TypeScript setup. Ships as a standard Vite project: `npm install`, `npm run dev`, `npm run build` (outputs `dist/`). Deployable unmodified to Netlify, Vercel, Firebase Hosting, and GitHub Pages.

### Routes (`src/routes/`)
- `/` Dashboard — dataset summary, quick stats, CTA to upload when empty
- `/upload` — CSV upload (drag/drop), preview table, column type detection, missing-value strategy (drop / mean / median / zero), dedupe toggle, normalization (none / min-max / z-score), target + optional date column pickers
- `/predict` — Model picker (Linear, Polynomial degree 2–5, Time-Series), feature selection, train/test split slider (default 80/20), Train button, predictions table, "Download predictions CSV"
- `/analytics` — Metric cards (R², MAE, MSE, RMSE), historical line chart, actual-vs-predicted chart, residuals bar chart, future forecast chart with configurable horizon

### Components
- `AppSidebar` (shadcn) with nav + collapse, active-route highlight
- `ThemeToggle` (light/dark via `.dark` on `<html>`, localStorage persistence)
- `FileDropzone`, `DatasetTable`, `MetricCard`, `EmptyState`
- Recharts wrappers: line, bar, scatter, forecast — colors bound to CSS vars

### State
- Zustand store `useDatasetStore` — parsed dataset, cleaning config, target/date columns, model config, trained model, predictions, metrics. Persisted to `localStorage`.

### Services (`src/services/`)
- `csv.ts` — Papaparse + type inference (number / date / string)
- `clean.ts` — imputation, dedupe, min-max + z-score scaling
- `models/linear.ts` — OLS via normal equations
- `models/polynomial.ts` — feature expansion + OLS
- `models/timeseries.ts` — linear trend + moving average, future horizon generator
- `split.ts` — shuffle + train/test split
- `metrics.ts` — R², MAE, MSE, RMSE

### Design (Slate + Coral)
- Tokens in `src/styles.css` via `@theme inline` over oklch `:root` vars
- Background `#0F172A`, surface `#1E293B`, primary coral `#F43F5E`, accent sky `#38BDF8`
- Gradient + shadow tokens for cards/CTAs
- Typography: Space Grotesk (headings) + Inter (body) loaded via `<link>` in `__root.tsx`
- Recharts colors driven by CSS vars so dark mode looks right

### Libraries to add
`papaparse`, `recharts`, `zustand` (+ types).

### Deployability config (the focus of this revision)
- Disable SSR in `vite.config.ts` so the build is a static SPA (works on GH Pages / Firebase without a Node host)
- `public/_redirects` → `/*  /index.html  200` (Netlify SPA fallback)
- `netlify.toml` → build cmd `npm run build`, publish dir `dist`, SPA redirect
- `vercel.json` → rewrites all routes to `/index.html`, build cmd + output dir
- `firebase.json` → `public: "dist"`, SPA rewrite to `/index.html`, ignore rules
- `.github/workflows/deploy-pages.yml` → build + publish `dist/` to GitHub Pages, with `BASE_PATH` env so subpath hosting works
- `vite.config.ts` honors `process.env.BASE_PATH` (defaults to `/`) for GH Pages subpaths
- `README.md` rewritten with: prerequisites, scripts, project structure, per-host deploy instructions (Netlify, Vercel, Firebase, GitHub Pages), and notes on env-free operation
- Confirm no Lovable-only runtime deps are pulled into the production bundle

### Verification before finishing
- Build runs clean and emits `dist/index.html` + assets
- Manual smoke check via preview: upload → train linear model → see metrics + forecast chart
- Confirm dark/light toggle works and persists

### Out of scope
- No server functions, auth, database, or external APIs
- No neural nets — regression + time-series only
