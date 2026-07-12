import { createElement, type ReactElement } from "react";
import type {
  ArticleEmbeddedElementProperties,
  ArticleEmbeddedElementName,
} from "@repo/markdown/article";
import { CopyButton } from "./components/copy-button";
import { GhCard } from "./components/gh-card";

type ArticleEmbeddedElementDescriptors = {
  [Name in ArticleEmbeddedElementName]: {
    create: (
      properties: ArticleEmbeddedElementProperties[Name],
    ) => ReactElement;
  };
};

export const articleEmbeddedElements = {
  "copy-button": {
    create: () => createElement(CopyButton),
  },
  "github-repo": {
    create: (properties) =>
      createElement(GhCard, {
        user: properties.user,
        repo: properties.repo,
      }),
  },
} satisfies ArticleEmbeddedElementDescriptors;

export function isArticleEmbeddedElementName(
  value: string,
): value is ArticleEmbeddedElementName {
  return Object.hasOwn(articleEmbeddedElements, value);
}

export function createArticleEmbeddedElement(
  name: ArticleEmbeddedElementName,
  properties: unknown,
): ReactElement {
  const descriptor = articleEmbeddedElements[name] as {
    create: (properties: unknown) => ReactElement;
  };
  return descriptor.create(properties);
}
