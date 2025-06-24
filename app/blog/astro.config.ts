import { defineConfig, envField } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import Icons from "unplugin-icons/vite";
import { siteDomain } from "./src/configs/site";
import react from "@astrojs/react";
import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: siteDomain,
  output: "static",
  integrations: [
    icon(),
    sitemap({
      serialize: (sitemapItem) => ({
        ...sitemapItem,
        url: sitemapItem.url.endsWith("/")
          ? sitemapItem.url.slice(0, -1)
          : sitemapItem.url,
      }),
    }),
    react(),
    partytown(),
  ],
  vite: {
    plugins: [
      tailwindcss(),
      Icons({ compiler: "jsx", jsx: "react" }),
      fileSystemPath(),
    ],
    server: {
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  },

  env: {
    schema: {
      ARTICLE_PAT: envField.string({ context: "server", access: "secret" }),
      // Preview
      LOCAL_PREVIEW: envField.boolean({
        context: "server",
        access: "public",
        default: false,
      }),
      VERCEL_ENV: envField.enum({
        values: ["production", "preview", "development"],
        context: "server",
        access: "public",
        optional: true,
      }),
      POST_GH_INFO: envField.string({
        context: "server",
        access: "secret",
      }),
      PAGE_GH_INFO: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  devToolbar: {
    enabled: false,
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
