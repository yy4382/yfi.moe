import type { Element, Node } from "hast";
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remarkReadingTime.mjs";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExtendedLinks from "rehype-extended-links";
import rehypeSlug from "rehype-slug";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import autoImport from "unplugin-auto-import/astro";
import { h } from "hastscript";
// https://astro.build/config
export default defineConfig({
  site: "https://yfi.moe/",
  integrations: [
    tailwind(),
    vue(),
    icon(),
    sitemap(),
    autoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
        /\.astro$/, // .astro
      ],

      imports: [
        {
          "astro-icon/components": ["Icon"],
          "@utils/path": ["getPostPath"],
          "@utils/content": ["getSortedPosts"],
          "@comp/elements/Card.astro": [["default", "Card"]],
          "@styles/tv": ["tvButton"],
        },
        {
          from: "astro:content",
          imports: ["CollectionEntry"],
          type: true,
        },
      ],
      dirs: ["./src/configs", "./src/components/modules/*/"],
      eslintrc: {
        enabled: true,
        filepath: "auto-imports-eslint.mjs",
        globalsPropValue: "readonly",
      },
      vueTemplate: true,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          content(node: Element): Node | Node[] {
            return h("span", { className: "heading-link" }, [
              "#" + node.tagName.toUpperCase(),
            ]);
          },
          properties: {
            ariaHidden: true,
            tabIndex: -1,
            style: "border-bottom: 0px;",
          },
          headingProperties: {
            className: "heading-linked",
          },
        },
      ],
      [
        rehypeExtendedLinks,
        {
          preContent(node: Element): Element | undefined {
            if (nodeHas(node, "img")) return undefined;
            const url = node.properties.href?.toString();
            if (!url) return undefined;
            const regex = /^(https?:\/\/)?(www\.)?github\.com\/.*/i;
            if (!regex.test(url)) return undefined;
            return h("span", { className: ["i-mingcute-github-line"] });
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
