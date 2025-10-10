import type { Element } from "hast";
import { h } from "hastscript";
import type { Blockquote, Paragraph, Root, Text } from "mdast";
import rehypeExternalLinks from "rehype-external-links";
import rehypeImageOptimization, {
  defineOptions as defineOptimizeOptions,
} from "rehype-image-optim";
import rehypeRaw from "rehype-raw";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import remarkRehype from "remark-rehype";
import { type Preset } from "unified";
import { rehypeCodeblockCopy } from "./plugins/rehype-codeblock-copy.js";
import rehypeExtendedLinks from "./plugins/rehype-extended-links.js";
import { remarkGithubRepo } from "./plugins/remark-github-repo.js";
import { remarkHeadingIds } from "./plugins/remark-heading-ids.js";
import { rehypeShikiPreset } from "./plugins/shiki-config.js";

export const linkIcons = (): [string, RegExp][] => [
  ["i-mingcute-github-line", /^(https?:\/\/)?(www\.)?github\.com\/.*/i],
  [
    "i-mingcute-twitter-line",
    /^(https?:\/\/)?(www\.)?(twitter|x|fxtwitter|fixupx)\.com\/.*/i,
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

export type SyncPreset = Preset & { __brand: "sync" };

export const ArticlePreset: Preset = {
  plugins: [
    remarkGfm,
    remarkGithubAlerts,
    remarkDirective,
    remarkGithubRepo,
    remarkHeadingIds,
    [remarkRehype, { allowDangerousHtml: true }],
    rehypeRaw,
    rehypeRemoveComments,
    [
      rehypeImageOptimization,
      defineOptimizeOptions({
        provider: "cloudflare",
        originValidation: (url: string) => {
          return new URL(url).hostname === "i.yfi.moe";
        },
        optimizeSrcOptions: { options: "f=auto,w=640,fit=scale-down" },
        srcsetOptionsList: [
          [{ options: "f=auto,w=320,fit=scale-down" }, "320w"],
          [{ options: "f=auto,w=640,fit=scale-down" }, "640w"],
          [{ options: "f=auto,w=1280,fit=scale-down" }, "1280w"],
        ],
        sizesOptionsList: ["(max-width: 640px) 320px", "640px"],
        style: "max-width: 100%; width:100%; height: auto;",
      }),
    ],
    [
      rehypeExtendedLinks,
      {
        preContent(node: Element): Element | undefined {
          if (nodeHas(node, "img")) return undefined;
          const url = node.properties.href?.toString();
          if (!url) return undefined;
          return linkIcons()
            .map(([icon, regex]) => {
              if (regex.test(url))
                return h("span", {
                  className: [icon, "prose-link-icon"],
                });
            })
            .find((i) => i !== undefined);
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
  ],
};

export const ArticlePresetFast: SyncPreset = {
  plugins: [
    remarkGfm,
    remarkGithubAlerts,
    [remarkRehype, { allowDangerousHtml: true }],
  ],
} satisfies Preset as SyncPreset;

export const ArticleRSSPreset: SyncPreset = {
  plugins: [
    () => {
      return function (tree: Root) {
        tree.children.unshift({
          type: "blockquote",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value:
                    "TIP: 在 RSS 阅读器中，一些组件可能无法正常显示。在浏览器中打开以获得更好的阅读体验。",
                } as Text,
              ],
            } as Paragraph,
          ],
        } as Blockquote);
      };
    },
    remarkGfm,
    [remarkRehype, { allowDangerousHtml: true }],
    rehypeRaw,
    rehypeRemoveComments,
    [
      rehypeImageOptimization,
      defineOptimizeOptions({
        provider: "cloudflare",
        originValidation: (url: string) => {
          return new URL(url).hostname === "i.yfi.moe";
        },
        optimizeSrcOptions: { options: "f=auto,w=640,fit=scale-down" },
        srcsetOptionsList: [
          [{ options: "f=auto,w=320,fit=scale-down" }, "320w"],
          [{ options: "f=auto,w=640,fit=scale-down" }, "640w"],
          [{ options: "f=auto,w=1280,fit=scale-down" }, "1280w"],
        ],
        sizesOptionsList: ["(max-width: 640px) 320px", "640px"],
        style: "max-width: 100%; width:100%; height: auto;",
      }),
    ],
  ],
} satisfies Preset as SyncPreset;

export const CommentPreset = {
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
} satisfies Preset as SyncPreset;
