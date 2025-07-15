import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import Slugger from "github-slugger";
import type { Plugin } from "unified";

export interface MarkdownHeading {
  depth: number;
  slug: string;
  text: string;
}

declare module "vfile" {
  interface DataMap {
    headings: MarkdownHeading[];
  }
}

export function remarkHeadingIds(): ReturnType<Plugin<[], Root, Root>> {
  return (tree, file) => {
    const slugger = new Slugger();
    const headings: MarkdownHeading[] = [];
    visit(tree, "heading", (node) => {
      if (node.type !== "heading") return;
      const depth = node.depth;

      let text = "";
      visit(node, (child) => {
        if ("value" in child) {
          text += child.value;
        }
      });

      let slug: string;
      const lastChildWithValue = node.children
        .slice()
        .reverse()
        .find((child) => "value" in child);
      const customRegex = /\{#(.*)\}$/;
      if (lastChildWithValue && customRegex.test(lastChildWithValue.value)) {
        slug = customRegex.exec(lastChildWithValue.value)?.[1]!;
        lastChildWithValue.value = lastChildWithValue.value
          .replace(customRegex, "")
          .trim();
        text = text.replace(customRegex, "").trim();
        if (slug.trim() === "") {
          slug = slugger.slug(text);
        }
      } else {
        slug = slugger.slug(text);
      }

      node.data = {
        hProperties: {
          id: slug,
        },
      };
      headings.push({ depth, slug, text });
    });
    file.data.headings = headings;
  };
}
