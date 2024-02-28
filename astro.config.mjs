import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import pagefind from "astro-pagefind";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remark-reading-time.mjs";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.yfi.moe/",
  integrations: [tailwind(), vue(), icon(), pagefind()],
  redirects: {
    "/": "/1",
  },
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
          content: [
            {
              type: "element",
              tagName: "object",
              properties: {
                data: "/external-link.svg",
                style: "fill: currentColor; width: 1em; height: 1em;",
              },
            },
          ],
        },
      ],
    ],
  },
});
