import type { Element, Root } from "hast";
import { h } from "hastscript";
import rehypeRaw from "rehype-raw";
import rehypeRemoveComments from "rehype-remove-comments";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified, type Plugin, type Preset } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import {
  getEmbeddedElementValidationError,
  isArticleEmbeddedElementName,
} from "./embedded-elements.js";
import { rehypeCodeblockCopy } from "./plugins/rehype-codeblock-copy.js";
import rehypeExtendedLinks from "./plugins/rehype-extended-links.js";
import type { ImageMeta } from "./plugins/rehype-image-metadata.js";
import { rehypeImageMetadata } from "./plugins/rehype-image-metadata.js";
import { rehypeImageOptimizationPlugin } from "./plugins/rehype-image-optimization.js";
import { remarkGithubRepo } from "./plugins/remark-github-repo.js";
import { remarkHeadingIds } from "./plugins/remark-heading-ids.js";
import { rehypeShikiPreset } from "./plugins/shiki-config.js";

export type {
  ArticleEmbeddedElementName,
  ArticleEmbeddedElementProperties,
} from "./embedded-elements.js";

export type ImageMetadata = ImageMeta;

export interface ArticleHeading {
  depth: number;
  id: string;
  text: string;
}

export interface ArticleRenderResult {
  hast: Root;
  outline: ArticleHeading[];
}

export interface ArticleRenderInput {
  imageMetadata?: readonly ImageMetadata[];
}

const linkIcons = (): [string, RegExp][] => [
  ["i-mingcute-github-line", /^(https?:\/\/)?(www\.)?github\.com\/.*$/i],
  [
    "i-mingcute-twitter-line",
    /^(https?:\/\/)?(www\.)?(twitter|x|fxtwitter|fixupx)\.com\/.*$/i,
  ],
  ["i-mingcute-sword-line", /^(https?:\/\/)?([\w-]+\.)*yfi\.moe(\/.*)?$/],
];

const nodeHas = (node: Element, tagName: string | string[]): boolean => {
  return node.children.some(
    (child) =>
      child.type === "element" &&
      (typeof tagName === "string"
        ? child.tagName === tagName
        : tagName.includes(child.tagName)),
  );
};

const rehypeValidateArticleEmbeddedElements: Plugin<[], Root> = () => {
  return (tree, file) => {
    visit(tree, "element", (node) => {
      if (!isArticleEmbeddedElementName(node.tagName)) return;
      const error = getEmbeddedElementValidationError(node);
      if (error) file.fail(error, node);
    });
  };
};

const articlePreset: Preset = {
  plugins: [
    remarkGfm,
    remarkGithubAlerts,
    remarkDirective,
    remarkGithubRepo,
    remarkHeadingIds,
    [remarkRehype, { allowDangerousHtml: true }],
    rehypeRaw,
    rehypeRemoveComments,
    rehypeImageMetadata,
    rehypeImageOptimizationPlugin,
    [
      rehypeExtendedLinks,
      {
        preContent(node: Element): Element | undefined {
          if (nodeHas(node, "img")) return undefined;
          const url = node.properties.href?.toString();
          if (!url) return undefined;
          return linkIcons()
            .map(([icon, regex]) => {
              if (regex.test(url)) {
                return h("span", {
                  className: [icon, "prose-link-icon"],
                });
              }
            })
            .find((icon) => icon !== undefined);
        },
        content(node: Element): Element | undefined {
          if (nodeHas(node, "img")) return undefined;
          return h("span", {
            className: ["i-mingcute-external-link-line", "prose-link-icon"],
          });
        },
        rel: ["noopener"],
      },
    ],
    rehypeShikiPreset,
    rehypeCodeblockCopy,
    rehypeValidateArticleEmbeddedElements,
  ],
};

export async function renderArticle(
  markdown: string,
  input: ArticleRenderInput = {},
): Promise<ArticleRenderResult> {
  const file = new VFile(markdown);
  if (input.imageMetadata) {
    file.data.imageMeta = [...input.imageMetadata];
  }

  const processor = unified().use(remarkParse).use(articlePreset);
  const hast = (await processor.run(processor.parse(file), file)) as Root;
  const outline = (file.data.headings ?? []).map(({ depth, slug, text }) => ({
    depth,
    id: slug,
    text,
  }));

  return { hast, outline };
}
