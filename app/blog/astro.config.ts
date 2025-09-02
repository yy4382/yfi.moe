// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { siteDomain } from "./src/config/site";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), icon(), sitemap()],
  output: "static",

  site: siteDomain,

  vite: {
    plugins: [tailwindcss(), fileSystemPath()],
  },

  env: {
    schema: {
      ARTICLE_PAT: envField.string({ context: "server", access: "secret" }),
      POST_GH_INFO: envField.string({ context: "server", access: "secret" }),
      PAGE_GH_INFO: envField.string({ context: "server", access: "secret" }),
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
