import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGithubAlerts from "remark-github-alerts";
import rehypeRaw from "rehype-raw";
import rehypeRemoveComments from "rehype-remove-comments";
import { unified } from "unified";
import RemoveMarkdown from "remove-markdown";

function truncateAtClosestNewline(str: string, targetPosition = 150) {
  while (str.startsWith("\n")) {
    str = str.slice(1);
  }
  let newPosition = str.lastIndexOf("\n", targetPosition);

  if (newPosition === -1) {
    newPosition = str.indexOf("\n", targetPosition);
    if (newPosition === -1) {
      return str;
    }
  }

  // 截取字符串到换行符的位置
  return str.substring(0, newPosition);
}

export function getDesc(
  content: string,
  config?: { length?: number; tryMore?: boolean; removeMd?: boolean },
) {
  const { length = 150, tryMore = true, removeMd = false } = config || {};
  content = content.trim();
  if (tryMore) {
    const moreIndex = content.indexOf("<!--more-->");
    if (moreIndex !== -1) {
      content = content.substring(0, moreIndex).trim();
    } else {
      content = truncateAtClosestNewline(content, length);
    }
  } else {
    content = truncateAtClosestNewline(content, length);
  }
  return removeMd
    ? RemoveMarkdown(content, { stripListLeaders: false })
    : content;
}

/**
 * Renders the description of the content.
 *
 * if tryMore, it will try to find the "<!--more-->" marker to truncate the content.
 * if not or not found, it will truncate the content at the closest newline at 150.
 *
 * @param content - The content to render the description from.
 * @param length - The maximum length of the description (optional).
 * @param tryMore - Indicates whether to try to find the "<!--more-->" marker to truncate the content (optional).
 * @returns The rendered description as a string.
 */
export async function renderDesc(
  content: string,
  length?: number,
  tryMore?: boolean,
) {
  return await renderMd(getDesc(content, { length, tryMore }));
}

export async function renderMd(content: string) {
  const HTML = await unified()
    .use(remarkParse)
    .use(remarkGithubAlerts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRemoveComments)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  return HTML.value.toString();
}
