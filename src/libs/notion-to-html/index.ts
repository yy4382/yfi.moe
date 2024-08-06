import type {
  RichTextItemResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { h } from "hastscript";
import type { Element, Properties, Root } from "hast";
import { toHtml } from "hast-util-to-html";

type Block = ListBlockChildrenResponse["results"][number];

type BlockConverted =
  | Element
  | [
      Element,
      {
        sameTypeWrapper?: {
          type: string;
          content: { selector: string; properties?: Properties };
        };
      },
    ];

export default function blocks2Html(
  blocks: Block[],
  options: { errorLevel: "prod" | "debug" } = { errorLevel: "prod" },
): string {
  const blockConverted = blocks
    .map((block) => convertBlock(block, options))
    .filter((block) => block !== undefined);
  return toHtml(concatBlockHtml(blockConverted));
}

export function concatBlockHtml(blocks: BlockConverted[]): Root {
  const mergedTypeWrapper = mergeSameTypeWrapperItems(blocks);
  if (mergedTypeWrapper === null) return h(null);
  else return h(null, mergedTypeWrapper);
}

function mergeSameTypeWrapperItems(arr: BlockConverted[]): Element[] | null {
  if (arr.length === 0) return null;

  const result: Element[] = [];
  let currentGroup: BlockConverted[] = [arr[0]];

  for (let i = 1; i < arr.length; i++) {
    const currentBlock = arr[i];
    const prevBlock = arr[i - 1];
    if (
      Array.isArray(currentBlock) &&
      Array.isArray(prevBlock) &&
      currentBlock[1].sameTypeWrapper !== undefined &&
      prevBlock[1].sameTypeWrapper !== undefined &&
      currentBlock[1].sameTypeWrapper.type === prevBlock[1].sameTypeWrapper.type
    ) {
      currentGroup.push(arr[i]);
    } else {
      result.push(pushCurrentGroup(currentGroup));
      currentGroup = [arr[i]];
    }
  }

  result.push(pushCurrentGroup(currentGroup));

  return result;
}

function pushCurrentGroup(currentGroup: BlockConverted[]): Element {
  // There will be only 2 situations:
  // 1. currentGroup contains one element, which is Element type
  // 2. currentGroup contains one or more elements, which are Tuple with same `sameTypeWrapper.type`

  const firstBlockToBePushed = currentGroup[0];
  if (
    Array.isArray(firstBlockToBePushed) &&
    firstBlockToBePushed[1].sameTypeWrapper !== undefined
  ) {
    const { selector, properties } =
      firstBlockToBePushed[1].sameTypeWrapper.content;
    const element = h(
      selector,
      properties !== undefined ? properties : {},
      currentGroup.map((block) => (block as [Element, unknown])[0]),
    );
    return element;
  } else {
    return firstBlockToBePushed as Element;
  }
}

export function convertBlock(
  node: Block,
  options: { errorLevel: "prod" | "debug" } = { errorLevel: "prod" },
): BlockConverted | undefined {
  if (!("type" in node)) {
    console.warn("unexpected node:", JSON.stringify(node));
    return undefined;
  }
  if (node.has_children) {
    console.warn(
      "node has children, currently not supported: ",
      JSON.stringify(node),
    );
  }
  switch (node.type) {
    case "paragraph": {
      return h("p", renderRichText(node.paragraph.rich_text));
    }

    case "image": {
      let url = "";
      switch (node.image.type) {
        case "external":
          url = node.image.external.url;
          break;
        case "file":
          url = node.image.file.url;
          break;
      }
      return h("img", { src: url, alt: renderRichText(node.image.caption) });
    }

    case "to_do": {
      return h(
        "p",
        h(
          "input",
          { type: "checkbox", checked: node.to_do.checked, disabled: true },
          renderRichText(node.to_do.rich_text),
        ),
      );
    }

    case "heading_1": {
      return h("h1", renderRichText(node.heading_1.rich_text));
    }

    case "heading_2": {
      return h("h2", renderRichText(node.heading_2.rich_text));
    }

    case "heading_3": {
      return h("h3", renderRichText(node.heading_3.rich_text));
    }

    case "bulleted_list_item": {
      return [
        h("li", renderRichText(node.bulleted_list_item.rich_text)),
        { sameTypeWrapper: { type: "ul", content: { selector: "ul" } } },
      ];
    }

    case "numbered_list_item": {
      return [
        h("li", renderRichText(node.numbered_list_item.rich_text)),
        { sameTypeWrapper: { type: "ol", content: { selector: "ol" } } },
      ];
    }

    case "quote": {
      return h("blockquote", renderRichText(node.quote.rich_text));
    }

    default: {
      console.warn("unsupported node type:", node.type);
      return options.errorLevel === "debug"
        ? h("p", `{{unsupported node type: ${node.type}}}`)
        : undefined;
    }
  }
}

export function renderRichText(
  richText: RichTextItemResponse[],
  options: { errorLevel: "prod" | "debug" } = { errorLevel: "prod" },
): string {
  return richText
    .map((item) => {
      switch (item.type) {
        case "text": {
          return item.text.content;
        }
        case "mention": {
          return `<a href="${item.href}">${item.plain_text}</a>`;
        }
        case "equation": {
          console.warn(
            "Equation isn't supported now and in predictable future, will be rendered as plain text.",
          );
          return item.plain_text;
        }
        default: {
          // @ts-expect-error in case notion add other types of rich text
          console.warn("unsupported rich text type:", item.type);
          return "plain_text" in item
            ? // @ts-expect-error in case notion add other types of rich text
              item.plain_text
            : options.errorLevel === "debug"
              ? // @ts-expect-error in case notion add other types of rich text
                `{{unsupported rich text type: ${item.type}}}`
              : "";
        }
      }
    })
    .join("");
}
