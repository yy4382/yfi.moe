import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export const processor = unified()
  .use(remarkParse)
  .use(remarkBreaks)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

export async function parseMarkdown(markdown: string) {
  return String(await processor.process(markdown));
}
