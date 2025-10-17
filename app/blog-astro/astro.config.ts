// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import font from "vite-plugin-font";
import { siteDomain } from "./src/config/site";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap(), mdx()],
  output: "static",

  site: siteDomain,

  vite: {
    plugins: [tailwindcss(), fileSystemPath(), font.vite() as any],
  },

  env: {
    schema: {
      ARTICLE_PAT: envField.string({ context: "server", access: "secret" }),
      POST_GH_INFO: envField.string({ context: "server", access: "secret" }),
      PAGE_GH_INFO: envField.string({ context: "server", access: "secret" }),
      IMAGE_META_SOURCE: envField.string({
        context: "server",
        access: "secret",
      }),
      WALINE_URL: envField.string({ context: "client", access: "public" }),
      POSTHOG_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      POSTHOG_HOST: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  server: {
    port: 3000,
  },
});

function fileSystemPath() {
  return {
    name: "vite-plugin-file-system-path",

    transform(_: unknown, id: string) {
      if (id.endsWith("?filepath")) {
        return {
          code: `export default ${JSON.stringify(id.slice(0, -9))}`,
          map: null,
        };
      }
    },
  };
}
