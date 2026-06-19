// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // This app is fully client-side, so build a static SPA shell for every
  // environment. That avoids route prerender/SSR crashes on Node 22 while still
  // producing deployable assets in dist/client/.
  nitro: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/_shell",
        crawlLinks: false,
        failOnError: false,
        retryCount: 0,
      },
    },
  },
});
