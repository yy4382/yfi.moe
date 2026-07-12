import type { Element } from "hast";

export interface ArticleEmbeddedElementProperties {
  "copy-button": Record<string, never>;
  "github-repo": {
    user: string;
    repo: string;
  };
}

export type ArticleEmbeddedElementName = keyof ArticleEmbeddedElementProperties;

export function isArticleEmbeddedElementName(
  tagName: string,
): tagName is ArticleEmbeddedElementName {
  return tagName === "copy-button" || tagName === "github-repo";
}

export function getEmbeddedElementValidationError(
  node: Element,
): string | undefined {
  if (node.tagName === "copy-button") {
    if (Object.keys(node.properties).length > 0) {
      return "copy-button must not have properties";
    }
    return;
  }

  if (node.tagName === "github-repo") {
    const keys = Object.keys(node.properties);
    if (
      keys.length !== 2 ||
      keys.some((key) => key !== "user" && key !== "repo") ||
      typeof node.properties.user !== "string" ||
      typeof node.properties.repo !== "string"
    ) {
      return "github-repo must have only string user and repo properties";
    }
  }
}
