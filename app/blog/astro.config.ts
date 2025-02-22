import type { Element } from "hast";
import { defineConfig, envField } from "astro/config";
import remarkGithubAlerts from "remark-github-alerts";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remarkReadingTime.mjs";
import rehypeExtendedLinks from "rehype-extended-links";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeRaw from "rehype-raw";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import Icons from "unplugin-icons/vite";
import { h } from "hastscript";
import { siteDomain } from "./src/configs/site";
import { linkIcons } from "./src/configs/markdown";
import react from "@astrojs/react";
import rehypeImageOptimization, {
  defineOptions as defineOptimizeOptions,
} from "rehype-image-optim";
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
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
    rehypePlugins: [
      rehypeRaw,
      rehypeRemoveComments,
      [
        rehypeImageOptimization,
        defineOptimizeOptions({
          provider: "cloudflare",
          originValidation: (url: string) => {
            return new URL(url).hostname === "i.yfi.moe";
          },
          optimizeSrcOptions: { options: "f=auto,w=640,fit=scale-down" },
          srcsetOptionsList: [
            [{ options: "f=auto,w=320,fit=scale-down" }, "320w"],
            [{ options: "f=auto,w=640,fit=scale-down" }, "640w"],
            [{ options: "f=auto,w=1280,fit=scale-down" }, "1280w"],
          ],
          sizesOptionsList: ["(max-width: 640px) 320px", "640px"],
          style: "max-width: 100%; width:100%; height: auto;",
        }),
      ],
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
      tailwindcss(),
      Icons({ compiler: "jsx", jsx: "react" }),
      fileSystemPath(),
    ],
    ssr: { external: ["@resvg/resvg-js"] },
    optimizeDeps: { exclude: ["@resvg/resvg-js"] },
    build: { rollupOptions: { external: ["@resvg/resvg-js"] } },
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
      VERCEL_AUTOMATION_BYPASS_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
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
