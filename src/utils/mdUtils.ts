import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGithubAlerts from "remark-github-alerts";
import { unified } from "unified";

function truncateAtClosestNewline(str: string, targetPosition: number = 150) {
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

export function getDesp(content: string, length?: number, tryMore?: boolean) {
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
  return content;
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
export async function renderDesp(
  content: string,
  length?: number,
  tryMore?: boolean
) {
  return await renderMd(getDesp(content, length, tryMore));
}

export async function renderMd(content: string) {
  const HTML = await unified()
    .use(remarkParse)
    .use(remarkGithubAlerts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  return HTML.value.toString();
}
