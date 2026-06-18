// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect Lovable's in-sandbox build (preview/dev). Inside the sandbox we keep
// the default SSR build so Lovable's preview works. Outside (Vercel, Netlify,
// Firebase, GitHub Pages, etc.) we switch to a static SPA build so the output
// in dist/client/ is a deployable single-page app.
const isLovableSandbox =
  !!process.env.DEV_SERVER__PROJECT_PATH || !!process.env.LOVABLE_SANDBOX;

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    ...(isLovableSandbox
      ? {}
      : {
          spa: {
            enabled: true,
            prerender: {
              outputPath: "/_shell",
              crawlLinks: false,
            },
          },
        }),
  },
});
