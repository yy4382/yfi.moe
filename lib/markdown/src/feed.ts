import type { Root as HastRoot } from "hast";
import type { Blockquote, Paragraph, Root, Text } from "mdast";
import rehypeRaw from "rehype-raw";
import rehypeRemoveComments from "rehype-remove-comments";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import type { Plugin, Preset } from "unified";
import { SKIP, visit } from "unist-util-visit";
import { compileHtml } from "./compile-html.js";
import {
  getEmbeddedElementValidationError,
  isArticleEmbeddedElementName,
} from "./embedded-elements.js";
import { rehypeImageOptimizationPlugin } from "./plugins/rehype-image-optimization.js";
import { remarkGithubRepo } from "./plugins/remark-github-repo.js";

const addFeedWarning: Plugin<[], Root> = () => {
  return (tree) => {
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
};

const rehypeFeedEmbeddedElements: Plugin<[], HastRoot> = () => {
  return (tree, file) => {
    visit(tree, "element", (node, index, parent) => {
      if (!isArticleEmbeddedElementName(node.tagName)) return;
      const error = getEmbeddedElementValidationError(node);
      if (error) file.fail(error, node);

      if (node.tagName === "copy-button") {
        if (parent && index != null) {
          parent.children.splice(index, 1);
          return [SKIP, index];
        }
        return SKIP;
      }

      const user = node.properties.user as string;
      const repo = node.properties.repo as string;
      node.tagName = "a";
      node.properties = {
        href: `https://github.com/${user}/${repo}`,
      };
      node.children = [{ type: "text", value: `${user}/${repo}` }];
    });
  };
};

const feedPreset: Preset = {
  plugins: [
    addFeedWarning,
    remarkGfm,
    remarkDirective,
    remarkGithubRepo,
    [remarkRehype, { allowDangerousHtml: true }],
    rehypeRaw,
    rehypeFeedEmbeddedElements,
    rehypeRemoveComments,
    rehypeImageOptimizationPlugin,
  ],
};

export function renderFeed(markdown: string): Promise<string> {
  return compileHtml(markdown, { preset: feedPreset });
}
