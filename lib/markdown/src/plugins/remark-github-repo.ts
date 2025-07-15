import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export function remarkGithubRepo(): ReturnType<Plugin<[], Root>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (tree, file) {
    visit(tree, function (node) {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        if (node.name !== "github-repo") {
          return;
        }
        const data = node.data || (node.data = {});
        const attributes = node.attributes;
        const repo = attributes?.repo;
        const user = attributes?.user;
        if (!repo || !user) {
          file.message("github-repo directive must have a repo and user", node);
          return;
        }

        if (
          node.type === "containerDirective" ||
          node.type === "textDirective"
        ) {
          file.fail("github directive is not supported on" + node.type);
        }

        data.hName = "github-repo";
        data.hProperties = {
          repo,
          user,
        };
      }
    });
  };
}
