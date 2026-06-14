import type { ComponentType, ReactNode } from "react";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import remarkParse from "remark-parse";
import { unified, type Preset } from "unified";
import { VFile } from "vfile";
import {
  IMAGE_META_KEY,
  type ImageMeta,
} from "./plugins/rehype-image-metadata.js";

type MarkdownInput = string | VFile;

export type MarkdownReactComponents = Record<
  string,
  // `rehype-react` accepts arbitrary custom element names. Their prop shapes
  // are supplied by the app component map, so keep this intentionally loose.
  keyof React.JSX.IntrinsicElements | ComponentType<any>
>;

export type MarkdownReactOptions = {
  preset: Preset;
  components?: MarkdownReactComponents;
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

export async function markdownToReact(
  rawContent: MarkdownInput,
  options: MarkdownReactOptions,
): Promise<ReactNode> {
  const processor = unified()
    .use(remarkParse)
    .use(options.preset)
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
      components: options.components,
    });

  const file = await processor.process(toVFile(rawContent, options.fileData));
  return file.result as ReactNode;
}
