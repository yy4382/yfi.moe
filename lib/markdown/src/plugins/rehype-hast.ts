import type { Root as HastRoot, Node } from "hast";
import type { Processor } from "unified";
import { removePosition as removePositionUtil } from "unist-util-remove-position";

declare module "unified" {
  interface CompileResultMap {
    HastRoot: HastRoot;
  }
}

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
  this.compiler = compiler;
}
