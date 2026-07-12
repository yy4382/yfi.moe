import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import { unified, type Preset } from "unified";

interface CompileHtmlOptions {
  preset: Preset;
  allowDangerousHtml?: boolean;
}

export async function compileHtml(
  markdown: string,
  options: CompileHtmlOptions,
): Promise<string> {
  const { preset, allowDangerousHtml = true } = options;
  const file = await unified()
    .use(remarkParse)
    .use(preset)
    .use(rehypeStringify, { allowDangerousHtml })
    .process(markdown);

  return String(file);
}
