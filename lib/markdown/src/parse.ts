import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import { unified, type Preset } from "unified";
import { VFile } from "vfile";
import type { MarkdownHeading } from "./plugins/remark-heading-ids.js";
import { remarkHeadingIds } from "./plugins/remark-heading-ids.js";
import type { SyncPreset } from "./preset.js";

export const markdownToHtml = (
  rawContent: string,
  {
    preset,
    stringifyAllowDangerous = true,
  }: {
    preset: SyncPreset;
    stringifyAllowDangerous?: boolean;
  },
) => {
  const processor = unified()
    .use(remarkParse)
    .use(preset)
    .use(rehypeStringify, {
      allowDangerousHtml: stringifyAllowDangerous,
    });
  return String(processor.processSync(rawContent));
};

export const markdownToHtmlAsync = async (
  rawContent: string,
  {
    preset,
    stringifyAllowDangerous = true,
  }: {
    preset: Preset;
    stringifyAllowDangerous?: boolean;
  },
) => {
  const processor = unified()
    .use(remarkParse)
    .use(preset)
    .use(rehypeStringify, {
      allowDangerousHtml: stringifyAllowDangerous,
    });
  const vfile = await processor.process(rawContent);
  return String(vfile);
};

export const markdownToHeadings = (rawContent: string): MarkdownHeading[] => {
  const vfile = new VFile(rawContent);
  const processor = unified().use(remarkParse).use(remarkHeadingIds);
  processor.runSync(processor.parse(vfile), vfile);

  return vfile.data.headings as MarkdownHeading[];
};

export type { MarkdownHeading };
