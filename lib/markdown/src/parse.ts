import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import { unified, type Preset } from "unified";
import { VFile } from "vfile";
import {
  IMAGE_META_KEY,
  type ImageMeta,
} from "./plugins/rehype-image-metadata.js";
import type { MarkdownHeading } from "./plugins/remark-heading-ids.js";
import { remarkHeadingIds } from "./plugins/remark-heading-ids.js";
import type { SyncPreset } from "./preset.js";

type MarkdownInput = string | VFile;

type MarkdownOptions<P extends Preset | SyncPreset> = {
  preset: P;
  stringifyAllowDangerous?: boolean;
  fileData?: VFile["data"];
};

function toVFile(rawContent: MarkdownInput, fileData?: VFile["data"]) {
  const file =
    typeof rawContent === "string" ? new VFile(rawContent) : rawContent;
  if (fileData) {
    Object.assign(file.data, fileData);
  }
  const legacyMeta = file.data[IMAGE_META_KEY] as ImageMeta[] | undefined;
  if (file.data.imageMeta && !legacyMeta) {
    file.data[IMAGE_META_KEY] = file.data.imageMeta;
  } else if (!file.data.imageMeta && legacyMeta) {
    file.data.imageMeta = legacyMeta;
  }
  return file;
}

export const markdownToHtml = (
  rawContent: MarkdownInput,
  options: MarkdownOptions<SyncPreset>,
) => {
  const { preset, stringifyAllowDangerous = true, fileData } = options;
  const processor = unified()
    .use(remarkParse)
    .use(preset)
    .use(rehypeStringify, {
      allowDangerousHtml: stringifyAllowDangerous,
    });
  const file = toVFile(rawContent, fileData);
  return String(processor.processSync(file));
};

export const markdownToHtmlAsync = async (
  rawContent: MarkdownInput,
  options: MarkdownOptions<Preset>,
) => {
  const { preset, stringifyAllowDangerous = true, fileData } = options;
  const processor = unified()
    .use(remarkParse)
    .use(preset)
    .use(rehypeStringify, {
      allowDangerousHtml: stringifyAllowDangerous,
    });
  const file = toVFile(rawContent, fileData);
  const vfile = await processor.process(file);
  return String(vfile);
};

export const markdownToHeadings = (rawContent: string): MarkdownHeading[] => {
  const vfile = new VFile(rawContent);
  const processor = unified().use(remarkParse).use(remarkHeadingIds);
  processor.runSync(processor.parse(vfile), vfile);

  return vfile.data.headings as MarkdownHeading[];
};

export type { MarkdownHeading };
