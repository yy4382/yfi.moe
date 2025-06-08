import type { Root } from "hast";
import { visit } from "unist-util-visit";

export function rehypeHast({ removePosition }: { removePosition: boolean }) {
  // @ts-expect-error this is a plugin
  const self = this;
  function compiler(tree: Root) {
    if (removePosition) {
      visit(tree, (node) => {
        if ("position" in node) {
          node.position = undefined;
        }
      });
    }
    return JSON.stringify(tree);
  }
  self.compiler = compiler;
}
