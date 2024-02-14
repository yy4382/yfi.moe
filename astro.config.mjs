import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import remarkGithubAlerts from "remark-github-alerts";
import pagefind from "astro-pagefind";
import icon from "astro-icon";
import remarkReadingTime from "./src/utils/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.yfi.moe/",
  integrations: [tailwind(), vue(), icon(), pagefind()],
  redirects: {
    "/": "/1",
  },
  markdown: {
    remarkPlugins: [remarkGithubAlerts, remarkReadingTime],
  },
});
