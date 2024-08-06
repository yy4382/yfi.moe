import type {
  RichTextItemResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";

type Block = ListBlockChildrenResponse["results"][number];

type BlockConverted =
  | string
  | [string, { sameTypeWrapper: { type: string; content: [string, string] } }];

export default function blocks2Html(
  blocks: Block[],
  options: { errorLevel: "prod" | "debug" } = { errorLevel: "prod" },
): string {
  return concatBlockHtml(blocks.map((block) => convertBlock(block, options)));
}

export function concatBlockHtml(blocks: BlockConverted[]) {
  let result = "";
  let currentSameTypeWrapper:
    | { type: string; content: [string, string] }
    | undefined = undefined;
  for (const block of blocks) {
    if (typeof block === "string") {
      if (currentSameTypeWrapper !== undefined) {
        result += currentSameTypeWrapper.content[1];
        currentSameTypeWrapper = undefined;
      }

      if (block === "<p></p>") continue;
      result += block;
    } else {
      if (currentSameTypeWrapper === undefined) {
        currentSameTypeWrapper = block[1].sameTypeWrapper;
        result += currentSameTypeWrapper.content[0];
      }
      if (currentSameTypeWrapper.type !== block[1].sameTypeWrapper.type) {
        result += currentSameTypeWrapper.content[1];
        currentSameTypeWrapper = block[1].sameTypeWrapper;
        result += currentSameTypeWrapper.content[0];
      }
      result += block[0];
    }
  }
  if (currentSameTypeWrapper !== undefined) {
    result += currentSameTypeWrapper.content[1];
  }
  return result;
}

export function convertBlock(
  node: Block,
  options: { errorLevel: "prod" | "debug" } = { errorLevel: "prod" },
): BlockConverted {
  if (!("type" in node)) {
    console.warn("unexpected node:", JSON.stringify(node));
    return "";
  }
  if (node.has_children) {
    console.warn(
      "node has children, currently not supported: ",
      JSON.stringify(node),
    );
  }
  switch (node.type) {
    case "paragraph": {
      return `<p>${renderRichText(node.paragraph.rich_text)}</p>`;
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
      return `<img src="${url}" alt="${renderRichText(node.image.caption)}" />`;
    }

    case "to_do": {
      return `<input type="checkbox" ${
        node.to_do.checked ? "checked" : ""
      } disabled /> ${renderRichText(node.to_do.rich_text)}<br />`;
    }

    case "heading_1": {
      return `<h1>${renderRichText(node.heading_1.rich_text)}</h1>`;
    }

    case "heading_2": {
      return `<h2>${renderRichText(node.heading_2.rich_text)}</h2>`;
    }

    case "heading_3": {
      return `<h3>${renderRichText(node.heading_3.rich_text)}</h3>`;
    }

    case "bulleted_list_item": {
      return [
        `<li>${renderRichText(node.bulleted_list_item.rich_text)}</li>`,
        { sameTypeWrapper: { type: "ul", content: ["<ul>", "</ul>"] } },
      ];
    }

    case "numbered_list_item": {
      return [
        `<li>${renderRichText(node.numbered_list_item.rich_text)}</li>`,
        { sameTypeWrapper: { type: "ol", content: ["<ol>", "</ol>"] } },
      ];
    }

    case "quote": {
      return `<blockquote>${renderRichText(node.quote.rich_text)}</blockquote>`;
    }

    default: {
      console.warn("unsupported node type:", node.type);
      return options.errorLevel === "debug"
        ? `{{unsupported node type: ${node.type}}}`
        : "";
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
