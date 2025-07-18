import type { Root as HastRoot, Node } from "hast";
import type { Processor } from "unified";
import { removePosition as removePositionUtil } from "unist-util-remove-position";

export function rehypeHast(
  this: Processor,
  { removePosition }: { removePosition: boolean },
) {
  function compiler(tree: Node): HastRoot {
    if (removePosition) {
      removePositionUtil(tree);
    }
    return tree as HastRoot;
  }
  // @ts-expect-error didn't add hast `Root` to unified CompilerResultMap,
  // because it will cause error when using `remark-rehype`
  this.compiler = compiler;
}
