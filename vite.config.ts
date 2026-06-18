// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Build as a static SPA so the output is deployable to Vercel, Netlify,
    // Firebase Hosting, GitHub Pages, etc. Prerender only the empty shell —
    // do not try to SSR app routes (they're client-only).
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/_shell",
        crawlLinks: false,
      },
    },
    server: { entry: "server" },
  },
});
