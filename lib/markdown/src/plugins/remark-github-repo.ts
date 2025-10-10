import type { Root } from "mdast";
import type remarkDirective from "remark-directive";
import type { Plugin } from "unified";
import { EXIT, visit } from "unist-util-visit";

/**
 * A plugin that transform directive `::github-repo{user="yy4382" repo="yfi.moe"}` to `<github-repo user="yy4382" repo="yfi.moe" />`.
 *
 * Must use after {@link remarkDirective}
 */
export function remarkGithubRepo(): ReturnType<Plugin<[], Root>> {
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

        if (
          node.type === "containerDirective" ||
          node.type === "textDirective"
        ) {
          file.fail("github directive is not supported on" + node.type);
          return EXIT;
        }

        if (!repo || !user) {
          file.fail("github-repo directive must have a repo and user", node);
          return EXIT;
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
