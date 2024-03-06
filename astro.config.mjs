import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import pagefind from "astro-pagefind";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remark-reading-time.mjs";
import rehypeExtendedLinks from "rehype-extended-links";

import partytown from "@astrojs/partytown";
import UnoCSS from "unocss/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.yfi.moe/",
  integrations: [
    UnoCSS({
      injectReset: true, // or a path to the reset file
    }),
    // tailwind(),
    vue(),
    icon(),
    pagefind(),
    partytown(),
  ],
  redirects: {
    "/": "/1",
  },
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
    rehypePlugins: [
      [
        rehypeExtendedLinks,
        {
          preContent(node) {
            const url = node.properties.href;
            if (!url) return undefined;
            const regex = /^(https?:\/\/)?(www\.)?github\.com\/.*/i;
            if (!regex.test(url)) return undefined;
            return {
              type: "element",
              tagName: "span",
              properties: {
                className: ["i-mingcute-github-fill"],
              },
              children: []
            };
          },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["i-mingcute-arrow-right-up-fill"],
            },
            children: [],
          },
        },
      ],
    ],
    remarkRehype: { allowDangerousHtml: true },
    shikiConfig: {
      theme: "catppuccin-macchiato",
    },
  },
});
