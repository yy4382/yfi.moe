import type { Element } from "hast";
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remarkReadingTime.mjs";
import rehypeExtendedLinks from "rehype-extended-links";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
// import autoImport from "unplugin-auto-import/astro";
import { h } from "hastscript";
import { siteDomain } from "./src/configs/site";
import { linkIcons } from "./src/configs/markdown";

// https://astro.build/config
export default defineConfig({
  site: siteDomain,
  devToolbar: {
    enabled: false,
  },
  integrations: [
    tailwind(),
    vue(),
    icon(),
    sitemap(),
    //   autoImport({
    //     include: [
    //       /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
    //       /\.vue$/,
    //       /\.vue\?vue/, // .vue
    //       /\.md$/, // .md
    //       /\.astro$/, // .astro
    //     ],

    //     imports: [
    //       {
    //         "astro-icon/components": ["Icon"],
    //         "@utils/path": ["getPostPath"],
    //         "@utils/content": ["getSortedPosts"],
    //         "@comp/elements/Card.astro": [["default", "Card"]],
    //         "@styles/tv": ["tvButton"],
    //       },
    //       {
    //         from: "astro:content",
    //         imports: ["CollectionEntry"],
    //         type: true,
    //       },
    //     ],
    //     dirs: ["./src/configs", "./src/components/modules/*/"],
    //     eslintrc: {
    //       enabled: true,
    //       filepath: "auto-imports-eslint.mjs",
    //       globalsPropValue: "readonly",
    //     },
    //     vueTemplate: true,
    //     viteOptimizeDeps: false,
    //   }),
  ],
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
    rehypePlugins: [
      [
        rehypeExtendedLinks,
        {
          preContent(node: Element): Element | undefined {
            if (nodeHas(node, "img")) return undefined;
            const url = node.properties.href?.toString();
            if (!url) return undefined;
            return linkIcons()
              .map(([icon, regex]) => {
                if (regex.test(url)) return h("span", { className: [icon] });
              })
              .find((i) => i !== undefined);
          },
          content(node: Element): Element | undefined {
            if (nodeHas(node, "img")) return undefined;
            return h("span", { className: ["i-mingcute-external-link-line"] });
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
