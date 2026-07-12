import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import remarkRehype from "remark-rehype";
import type { Preset } from "unified";
import { compileHtml } from "./compile-html.js";

const excerptPreset: Preset = {
  plugins: [
    remarkGfm,
    remarkGithubAlerts,
    [remarkRehype, { allowDangerousHtml: true }],
  ],
};

export function renderExcerpt(markdown: string): Promise<string> {
  return compileHtml(markdown, { preset: excerptPreset });
}
