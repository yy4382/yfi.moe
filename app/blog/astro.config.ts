import type { Element } from "hast";
import { defineConfig, envField } from "astro/config";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remarkReadingTime.mjs";
import rehypeExtendedLinks from "rehype-extended-links";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeRaw from "rehype-raw";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import Icons from "unplugin-icons/vite";
import { h } from "hastscript";
import { siteDomain } from "./src/configs/site";
import { linkIcons } from "./src/configs/markdown";
import vercel from "@astrojs/vercel/serverless";
import svgr from "vite-plugin-svgr";
import react from "@astrojs/react";
import rehypeImageOptimization from "rehype-image-optim";

// https://astro.build/config
export default defineConfig({
  site: siteDomain,
  output: "hybrid",
  adapter: vercel({ imageService: true }),
  integrations: [tailwind(), vue(), icon(), sitemap(), react()],
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
    rehypePlugins: [
      rehypeRaw,
      rehypeRemoveComments,
      rehypeImageOptimization,
      [
        rehypeExtendedLinks,
        {
          preContent(node: Element): Element | undefined {
            if (nodeHas(node, "img")) return undefined;
            const url = node.properties.href?.toString();
            if (!url) return undefined;
            return linkIcons()
              .map(([icon, regex]) => {
                if (regex.test(url))
                  return h("span", {
                    className: [icon],
                  });
              })
              .find((i) => i !== undefined);
          },
          content(node: Element): Element | undefined {
            if (nodeHas(node, "img")) return undefined;
            return h("span", {
              className: ["i-mingcute-external-link-line"],
            });
          },
        },
      ],
    ],
    remarkRehype: {
      allowDangerousHtml: true,
    },
    shikiConfig: {
      theme: "catppuccin-macchiato",
    },
  },
  vite: {
    plugins: [
      svgr({
        svgrOptions: {
          icon: "1em",
        },
      }),
      Icons({ compiler: "vue3" }),
    ],
  },
  experimental: {
    serverIslands: true,
    env: {
      schema: {
        // Algolia
        ALGOLIA_WRITE_API_KEY: envField.string({
          context: "server",
          access: "secret",
        }),

        // Notion
        NOTION_API_KEY: envField.string({
          context: "server",
          access: "secret",
        }),
        NOTION_NOTE_DATABASE_ID: envField.string({
          context: "server",
          access: "secret",
        }),

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
        VERCEL_AUTOMATION_BYPASS_SECRET: envField.string({
          context: "server",
          access: "secret",
          optional: true,
        }),
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
});
const nodeHas = (node: Element, tagName: string | string[]): boolean => {
  return node.children.some(
    (child) =>
      child.type === "element" &&
      (typeof tagName === "string"
        ? child.tagName === tagName
        : tagName.includes(child.tagName)),
  );
};
