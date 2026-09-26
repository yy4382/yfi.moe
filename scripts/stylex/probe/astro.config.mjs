import react from "@astrojs/react";
import stylex from "@stylexjs/unplugin";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  integrations: [react()],
  build: { inlineStylesheets: "never" },
  vite: {
    cacheDir: fileURLToPath(new URL("./cache.local/", import.meta.url)),
    plugins: [
      {
        name: "stylex-astro-reload",
        handleHotUpdate(ctx) {
          if (ctx.file.endsWith(".stylex.ts"))
            ctx.server.ws.send({ type: "full-reload" });
        },
      },
      stylex.vite({
        useCSSLayers: true,
        devMode: "css-only",
        lightningcssOptions: { minify: true },
        dev: process.env.NODE_ENV === "development",
        runtimeInjection: false,
      }),
    ],
  },
});
