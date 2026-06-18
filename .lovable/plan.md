## Why Vercel shows 404: NOT_FOUND

This project is built on **TanStack Start**, which is a full-stack SSR framework. By default its build uses Nitro and targets the **Cloudflare Workers** preset — it does **not** emit a plain static `index.html` + assets into `dist/`. When Vercel deploys it as a static site with the current `vercel.json` (`outputDirectory: dist`, SPA rewrite to `/index.html`), there is no `index.html` to serve, so every URL 404s.

The original requirement was: a plain static SPA that drops into Netlify, Vercel, Firebase Hosting, etc. TanStack Start in SSR mode is the wrong shape for that.

## Plan: switch the build to static SPA output

Keep all current routes, components, services, and UI — only change the build/runtime shell so the output is a static SPA in `dist/`.

### 1. Configure TanStack Start for SPA / prerender mode
- Update `vite.config.ts` to disable SSR and enable SPA mode via the `@lovable.dev/vite-tanstack-config` options (set Nitro preset to `static` and enable `spa: { enabled: true }` with a `/` shell route).
- Result: `vite build` emits `dist/index.html` + `dist/assets/*` with a client-side router fallback — exactly what Vercel/Netlify/Firebase expect.

### 2. Remove server-only code paths from the client shell
- `src/routes/__root.tsx` currently uses `shellComponent` (SSR HTML shell). Replace with a standard client root that renders `<RouterProvider>` content — head tags handled by TanStack Router's `head()` API still work in SPA mode.
- Delete / stop importing `src/server.ts`, `src/start.ts`, and `src/lib/config.server.ts` from the client graph (they remain in the repo but are not referenced).
- Remove `tanstackStart.server.entry` override from `vite.config.ts`.

### 3. Verify hosting configs still match
- `vercel.json` — keep `outputDirectory: dist` and SPA rewrite. ✅
- `netlify.toml` + `public/_redirects` — already configured for SPA. ✅
- `firebase.json` — already rewrites all to `/index.html`. ✅

### 4. Validate
- Run `npm run build`, confirm `dist/index.html` exists and `dist/assets/` is populated.
- Spot-check `npm run preview` locally serves `/`, `/upload`, `/analytics`, `/predict` without 404 on refresh.
- Redeploy to Vercel — the same `vercel.json` will then work because `dist/` actually contains a static SPA.

## Technical details

- Lovable's `@lovable.dev/vite-tanstack-config` wraps `tanstackStart` + `nitro`. SPA mode is supported via the `spa` option on `tanstackStart` and `preset: "static"` on `nitro`. Both are passed through `defineConfig({ tanstackStart: {...}, nitro: {...} })`.
- After the switch, server functions (`createServerFn`) and any `src/routes/api/*` server routes will NOT run in production — there is no server. The current app uses only client-side CSV parsing and in-memory modeling (see `src/services/*` and `src/store/dataset.ts`), so this is safe.
- `src/routeTree.gen.ts` is regenerated automatically; no manual edits.

## Out of scope

- No UI/feature changes.
- No new dependencies.
- GitHub Pages workflow stays removed (per your earlier request).
