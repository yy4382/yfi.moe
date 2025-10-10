import type { Root } from "hast";
import { h } from "hastscript";
import type { Plugin } from "unified";
import { SKIP, visit } from "unist-util-visit";

export const rehypeCodeblockCopy: Plugin<[], Root> = function () {
  return (tree) => {
    visit(tree, "element", (node, __, parent) => {
      if (node.tagName !== "code") return;
      if (!parent || parent.type !== "element" || parent.tagName !== "pre")
        return;
      if (parent.properties.class) {
        if (Array.isArray(parent.properties.class)) {
          parent.properties.class.push("copy-code-pre");
        } else if (typeof parent.properties.class === "string") {
          parent.properties.class = parent.properties.class + " copy-code-pre";
        } else {
          parent.properties.class = ["copy-code-pre"];
        }
      } else {
        parent.properties.class = ["copy-code-pre"];
      }
      const copyButton = h("copy-button");
      parent.children.push(copyButton);
      return SKIP;
    });
  };
};
