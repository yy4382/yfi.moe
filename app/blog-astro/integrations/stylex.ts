import stylex from "@stylexjs/unplugin";
import type { AstroIntegration } from "astro";
import { stylexLayers } from "../../../stylex-layers";

/** Compile shared TypeScript styles for Astro SSR and React islands. */
export default function stylexIntegration(): AstroIntegration {
  return {
    name: "blog-stylex",
    hooks: {
      "astro:config:setup": ({ updateConfig, injectScript, command }) => {
        updateConfig({
          // StyleX appends CSS to an emitted asset; inline CSS has no such asset.
          build: { inlineStylesheets: "never" },
          vite: {
            build: { cssCodeSplit: false },
            plugins: [
              {
                name: "stylex-astro-reload",
                handleHotUpdate(context) {
                  // Astro HTML holds server-rendered class attributes. CSS-only
                  // refresh cannot replace them after an atomic class changes.
                  if (context.file.endsWith(".stylex.ts")) {
                    context.server.ws.send({ type: "full-reload" });
                  }
                },
              },
              // Vitest has no HTTP server to close the Vite plugin's HMR timer.
              (process.env.VITEST ? stylex.rollup : stylex.vite)({
                useCSSLayers: stylexLayers("app"),
                devMode: "css-only",
                dev: command === "dev",
                runtimeInjection: false,
                lightningcssOptions: { minify: true },
              }),
            ],
          },
        });
        if (command === "dev") {
          injectScript("before-hydration", 'import "virtual:stylex:css-only";');
        }
      },
    },
  };
}
