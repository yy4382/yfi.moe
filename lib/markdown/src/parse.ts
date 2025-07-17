import rehypeStringify from "rehype-stringify";
import { rehypeHast } from "./plugins/rehype-hast";
import { ArticlePreset, ArticlePresetFast } from "./preset";
import type { MarkdownHeading } from "./plugins/remark-heading-ids";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { remarkHeadingIds } from "./plugins/remark-heading-ids";
import { VFile } from "vfile";
import type { Root } from "hast";

export const markdownToHast = async (
  rawContent: string,
  { fast = false }: { fast?: boolean } = {},
) => {
  const preset = fast ? ArticlePresetFast : ArticlePreset;

  const hastVfile = await unified()
    .use(remarkParse)
    .use(preset)
    .use(rehypeHast, { removePosition: true })
    .process(rawContent);

  return hastVfile.result as Root;
};

export const markdownToHtml = async (rawContent: string) => {
  return String(
    await unified()
      .use(remarkParse)
      .use(ArticlePreset)
      .use(rehypeStringify, {
        allowDangerousHtml: true,
      })
      .process(structuredClone(rawContent)),
  );
};

export const markdownToHeadings = (rawContent: string): MarkdownHeading[] => {
  const vfile = new VFile(rawContent);
  const processor = unified().use(remarkParse).use(remarkHeadingIds);
  processor.runSync(processor.parse(vfile), vfile);

  return vfile.data.headings as MarkdownHeading[];
};

export type { MarkdownHeading };
