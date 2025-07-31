import { type Preset } from "unified";
import remarkGithubAlerts from "remark-github-alerts";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeImageOptimization, {
  defineOptions as defineOptimizeOptions,
} from "rehype-image-optim";
import rehypeExtendedLinks from "./plugins/rehype-extended-links.js";
import { h } from "hastscript";
import type { Element } from "hast";
import rehypeShiki from "@shikijs/rehype";
import { remarkHeadingIds } from "./plugins/remark-heading-ids.js";
import { rehypeCodeblockCopy } from "./plugins/rehype-codeblock-copy.js";
import remarkDirective from "remark-directive";
import { remarkGithubRepo } from "./plugins/remark-github-repo.js";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import rehypeExternalLinks from "rehype-external-links";

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
                  className: [icon],
                });
            })
            .find((i) => i !== undefined);
        },
        content(node: Element): Element | undefined {
          if (nodeHas(node, "img")) return undefined;
          return h("span", {
            className: ["i-mingcute-external-link-line"],
          });
        },
        rel: ["noopener"],
      },
    ],
    [rehypeShiki, { theme: "catppuccin-macchiato" }],
    rehypeCodeblockCopy,
  ],
};

export const ArticlePresetFast: Preset = {
  plugins: [
    remarkGfm,
    remarkGithubAlerts,
    [remarkRehype, { allowDangerousHtml: true }],
  ],
};

export const CommentPreset: Preset = {
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
