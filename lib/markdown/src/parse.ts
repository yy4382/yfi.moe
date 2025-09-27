import type { Root } from "hast";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import { unified, type Preset } from "unified";
import { VFile } from "vfile";
import { rehypeHast } from "./plugins/rehype-hast.js";
import type { MarkdownHeading } from "./plugins/remark-heading-ids.js";
import { remarkHeadingIds } from "./plugins/remark-heading-ids.js";
import { ArticlePreset, ArticlePresetFast } from "./preset.js";

export const markdownToHast = async (
  rawContent: string,
  {
    fast = false,
    preset: presetParam = ArticlePreset,
    sync = false,
  }: { fast?: boolean; preset?: Preset; sync?: boolean } = {},
) => {
  const preset = fast ? ArticlePresetFast : presetParam;
  const processor = unified()
    .use(remarkParse)
    .use(preset)
    .use(rehypeHast, { removePosition: true });
  if (sync) {
    return processor.processSync(rawContent).result as Root;
  }
  return (await processor.process(rawContent)).result as Root;
};

export const markdownToHtml = async (
  rawContent: string,
  {
    preset = ArticlePreset,
    stringifyAllowDangerous = true,
    sync = false,
  }: {
    preset?: Preset;
    stringifyAllowDangerous?: boolean;
    sync?: boolean;
  } = {},
) => {
  const processor = unified()
    .use(remarkParse)
    .use(preset)
    .use(rehypeStringify, {
      allowDangerousHtml: stringifyAllowDangerous,
    });
  if (sync) {
    return String(processor.processSync(rawContent));
  }
  return String(await processor.process(structuredClone(rawContent)));
};

export const markdownToHeadings = (rawContent: string): MarkdownHeading[] => {
  const vfile = new VFile(rawContent);
  const processor = unified().use(remarkParse).use(remarkHeadingIds);
  processor.runSync(processor.parse(vfile), vfile);

  return vfile.data.headings as MarkdownHeading[];
};

export type { MarkdownHeading };
