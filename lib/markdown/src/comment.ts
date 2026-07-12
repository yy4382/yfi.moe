import rehypeExternalLinks from "rehype-external-links";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import type { Preset } from "unified";
import { compileHtml } from "./compile-html.js";

const commentPreset: Preset = {
  plugins: [
    remarkBreaks,
    remarkGfm,
    remarkRehype,
    rehypeSanitize,
    [
      rehypeExternalLinks,
      {
        rel: ["nofollow", "noopener", "noreferrer", "ugc"],
        target: ["_blank"],
      },
    ],
  ],
};

export function renderComment(markdown: string): Promise<string> {
  return compileHtml(markdown, {
    preset: commentPreset,
    allowDangerousHtml: false,
  });
}
