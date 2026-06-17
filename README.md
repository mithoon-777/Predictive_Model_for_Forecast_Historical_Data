# Forecastr — Predictive Analytics Dashboard

A modern, in-browser predictive analytics dashboard. Upload historical CSV data, clean and preprocess it, train regression / time-series models, and visualize future forecasts — all client-side, no backend required.

## Features

- **Data Upload & Processing** — CSV upload, preview table, missing-value handling (drop / mean / median / zero), deduplication, min-max & z-score scaling, target & date column selection
- **Predictive Modeling** — Linear Regression, Polynomial Regression (degree 2–5), Time-Series Forecasting
- **Train/Test Split** — Configurable from 60/40 to 90/10
- **Metrics** — R², MAE, MSE, RMSE
- **Charts** — Historical trend, actual vs predicted, residuals, future forecast, scatter plot
- **Modern UI** — Responsive dashboard, collapsible sidebar, light/dark mode, professional design

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** build pipeline (build output: `dist/`)
- **TanStack Router** (file-based routing under `src/routes/`)
- **TanStack Query**
- **Tailwind CSS v4** + **shadcn/ui** components
- **Recharts** for visualization
- **Papaparse** for CSV parsing
- **Zustand** for state (persisted to localStorage)

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produces dist/
npm run preview  # preview the production build
```

> Requires Node.js 20+.

## Project Structure

```
.
├── public/                     # static assets (incl. _redirects for Netlify SPA fallback)
├── src/
│   ├── components/             # reusable UI (sidebar, theme toggle, charts, dropzone, etc.)
│   │   └── ui/                 # shadcn primitives
│   ├── routes/                 # file-based routes (TanStack Router)
│   │   ├── __root.tsx          # root layout (sidebar + header + outlet)
│   │   ├── index.tsx           # /         Dashboard
│   │   ├── upload.tsx          # /upload   CSV upload & cleaning
│   │   ├── predict.tsx         # /predict  Model training
│   │   └── analytics.tsx       # /analytics  Charts & metrics
│   ├── services/               # CSV, cleaning, models, metrics, train/test split
│   │   └── models/             # linear, polynomial, timeseries
│   ├── store/                  # Zustand store (persisted)
│   ├── styles.css              # design tokens (Slate + Coral)
│   └── router.tsx              # router bootstrap
├── netlify.toml                # Netlify config (build + SPA redirect)
├── vercel.json                 # Vercel config (build + SPA rewrite)
├── firebase.json               # Firebase Hosting config (SPA rewrite)
├── .github/workflows/
│   └── deploy-pages.yml        # GitHub Pages CI workflow
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Deployment

Build command: `npm run build` · Output directory: `dist`

### Netlify

Push the repo to GitHub and import it on Netlify, or:

```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

`netlify.toml` already declares the build command, publish dir, and SPA redirect.

### Vercel

```bash
npm i -g vercel
vercel --prod
```

`vercel.json` declares the build command, output directory, and SPA rewrite. Or simply import the repo on vercel.com — auto-detected.

### Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # accept defaults, public dir = "dist", SPA = yes
npm run build
firebase deploy --only hosting
```

Note: `firebase.json` is already configured — if `firebase init` asks to overwrite it, choose **No** and just set your project with `firebase use --add`.

### GitHub Pages

1. Push to GitHub on the `main` branch.
2. In your repository **Settings → Pages**, set "Source" to **GitHub Actions**.
3. The workflow at `.github/workflows/deploy-pages.yml` builds with the correct `BASE_PATH` (so sub-path hosting works) and deploys `dist/` automatically. A `404.html` copy is created as the SPA fallback.

## Scripts

| Script             | Purpose                              |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the dev server                 |
| `npm run build`    | Production build to `dist/`          |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | ESLint                                |
| `npm run format`   | Prettier                              |

## Notes

- Everything runs **client-side** — no backend, no environment variables, no API keys required.
- Dataset and model state are persisted to `localStorage` so refreshing keeps your work.
- Routing uses TanStack Router's file-based conventions under `src/routes/`. Page filenames map to URL paths (e.g. `upload.tsx` → `/upload`).
