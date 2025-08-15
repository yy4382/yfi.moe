// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), icon()],

  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      ARTICLE_PAT: envField.string({ context: "server", access: "secret" }),
      POST_GH_INFO: envField.string({ context: "server", access: "secret" }),
      PAGE_GH_INFO: envField.string({ context: "server", access: "secret" }),
    },
  },
});
