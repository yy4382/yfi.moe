import { visit } from "unist-util-visit";

export function remarkGithubRepo() {
  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (tree: any, file: any) {
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
        const repo = attributes.repo;
        const user = attributes.user;

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
