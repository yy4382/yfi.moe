import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remarkReadingTime.mjs";
import rehypeExtendedLinks from "rehype-extended-links";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import autoImport from "unplugin-auto-import/astro";

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
          "@comp/base/Card.astro": [["default", "Card"]],
        },
        {
          from: "astro:content",
          imports: ["CollectionEntry"],
          type: true,
        },
      ],
      defaultExportByFilename: true,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
    rehypePlugins: [
      [
        rehypeExtendedLinks,
        {
          preContent(node: any) {
            const url = node.properties.href;
            if (!url) return undefined;
            const regex = /^(https?:\/\/)?(www\.)?github\.com\/.*/i;
            if (!regex.test(url)) return undefined;
            return {
              type: "element",
              tagName: "span",
              properties: {
                className: ["i-mingcute-github-line"],
              },
              children: [],
            };
          },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["i-mingcute-external-link-line"],
            },
            children: [],
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
