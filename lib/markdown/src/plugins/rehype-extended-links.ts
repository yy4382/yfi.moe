// @ts-ignore
import structuredClone from "@ungap/structured-clone";
import type { Element, ElementContent, Properties, Root } from "hast";
import type { Test } from "hast-util-is-element";
import { convertElement } from "hast-util-is-element";
import isAbsoluteUrl from "is-absolute-url";
import { parse } from "space-separated-tokens";
import { visit } from "unist-util-visit";

type Content =
  | ElementContent[]
  | CreateContent
  | ElementContent
  | null
  | undefined;

type CreateContent = (
  element: Element,
) => ElementContent[] | ElementContent | null | undefined;

type CreateProperties = (element: Element) => Properties | null | undefined;

type CreateRel = (element: Element) => string[] | string | null | undefined;

type CreateTarget = (element: Element) => Target | null | undefined;

type Target = "_blank" | "_self" | "_parent" | "_top";

export interface Options {
  content?: Content;
  preContent?: Content;
  properties?: CreateProperties | Properties | null | undefined;
  wrappedProperties?: Properties | null | undefined;
  protocols?: string[] | null | undefined;
  rel?: string[] | CreateRel | null | undefined;
  target?: CreateTarget | Target | null | undefined;
  test?: Test | null | undefined;
}

const defaultProtocols = ["http", "https"];
const defaultRel = ["nofollow"];

const emptyOptions: Options = {};

export default function rehypeExtendedLinks(
  options: Options | null | undefined,
) {
  const settings = options || emptyOptions;
  const protocols = settings.protocols || defaultProtocols;
  const is = convertElement(settings.test);

  return function (tree: Root): undefined {
    visit(tree, "element", function (node, index, parent) {
      if (
        node.tagName === "a" &&
        typeof node.properties.href === "string" &&
        is(node, index, parent)
      ) {
        const url = node.properties.href;

        if (
          isAbsoluteUrl(url)
            ? protocols.includes(url.slice(0, url.indexOf(":")))
            : url.startsWith("//")
        ) {
          const contentRaw = createIfNeeded(settings.content, node);
          const content =
            contentRaw && !Array.isArray(contentRaw)
              ? [contentRaw]
              : contentRaw;
          const preContentRaw = createIfNeeded(settings.preContent, node);
          const preContent =
            preContentRaw && !Array.isArray(preContentRaw)
              ? [preContentRaw]
              : preContentRaw;

          const relRaw = createIfNeeded(settings.rel, node) || defaultRel;
          const rel = typeof relRaw === "string" ? parse(relRaw) : relRaw;
          const target = createIfNeeded(settings.target, node);

          const properties = createIfNeeded(settings.properties, node);

          const wrapped = content || preContent;

          if (properties) {
            Object.assign(node.properties, structuredClone(properties));
          }

          if (rel.length > 0) {
            node.properties.rel = [...rel];
          }

          if (target) {
            node.properties.target = target;
          }

          if (!wrapped) return;

          if (settings.wrappedProperties) {
            const rawContent = structuredClone(node.children);
            const children: Element = {
              type: "element",
              tagName: "span",
              children: rawContent,
              properties: settings.wrappedProperties,
            };
            node.children = [children];
          }

          if (content) {
            node.children.push(...content);
          }

          if (preContent) {
            node.children.unshift(...preContent);
          }
        }
      }
    });
  };
}

function createIfNeeded<T>(
  value: T,
  element: Element,
): T extends (...args: any) => any ? ReturnType<T> : T {
  return (typeof value === "function" ? value(element) : value) as T extends (
    ...args: any
  ) => any
    ? ReturnType<T>
    : T;
}
