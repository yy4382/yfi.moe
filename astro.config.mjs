import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import pagefind from "astro-pagefind";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remark-reading-time.mjs";
import rehypeExtendedLinks from "rehype-extended-links";

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
        rehypeExtendedLinks,
        {
          preContentMap: new Map([
            [
              /^(https?:\/\/)?(www\.)?github\.com\/.*/i,
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["rh-pre-content"],
                },
                children: [
                  {
                    type: "element",
                    tagName: "svg",
                    properties: {},
                    children: [
                      {
                        type: "element",
                        tagName: "use",
                        properties: {
                          href: "#github-icon",
                        },
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          ]),
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["rh-post-content"],
            },
            children: [
              {
                type: "element",
                tagName: "svg",
                properties: {},
                children: [
                  {
                    type: "element",
                    tagName: "use",
                    properties: {
                      href: "#external-link-icon",
                    },
                    children: [],
                  },
                ],
              },
            ],
          },
        },
      ],
    ],
  },
});
