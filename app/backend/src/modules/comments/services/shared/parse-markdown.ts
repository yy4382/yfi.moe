import { markdownToHtml } from "@repo/markdown/parse";
import { CommentPreset } from "@repo/markdown/preset";

export function parseMarkdown(content: string) {
  return markdownToHtml(content, {
    preset: CommentPreset,
    stringifyAllowDangerous: false,
  });
}
