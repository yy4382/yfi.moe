// rehype-replace-custom-elements.ts
import type { Root, Element, ElementContent, Properties } from "hast";
import { fromHtml } from "hast-util-from-html";
import type { Plugin } from "unified";
import { visit, SKIP } from "unist-util-visit";

type Replacer = string | ((node: Element, props: Properties) => string);

export interface Options {
  /**
   * Map tagName -> replacement HTML string (or function that returns one).
   * The replacer receives the original HAST Element and its props for convenience.
   */
  map: Record<string, Replacer>;
}

const rehypeReplaceCustomElements: Plugin<[Options], Root> = (options) => {
  const map = options?.map ?? {};

  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index == null) return;

      const replacer = map[node.tagName];
      if (!replacer) return;

      const html =
        typeof replacer === "function"
          ? replacer(node, node.properties ?? {})
          : replacer;

      const fragment = fromHtml(html, { fragment: true });
      const newNodes = fragment.children as ElementContent[];

      parent.children.splice(index, 1, ...newNodes);

      return SKIP; // don’t re-visit inserted nodes
    });
  };
};

export default rehypeReplaceCustomElements;
