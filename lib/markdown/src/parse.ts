import { parseFrontmatter } from "@astrojs/markdown-remark";
import { rehypeHast } from "./plugins/rehype-hast";
import { baseProcessor } from "./processor";

export const parseMarkdown = async (
  rawContent: string,
  filename?: string,
  logger?: {
    error: (message: string) => void;
  },
) => {
  const { frontmatter, content } = parseFrontmatter(rawContent, {
    frontmatter: "empty-with-spaces",
  });

  if (!("slug" in frontmatter && typeof frontmatter.slug === "string")) {
    logger?.error(`File ${filename} has no slug`);
    throw new Error(`File ${filename} has no slug`);
  }

  const hastVfile = await baseProcessor()
    .use(rehypeHast, {
      removePosition: true,
    })
    .process(structuredClone(content));

  const hastString = String(hastVfile);

  return {
    id: frontmatter.slug,
    body: content.trim(),
    data: {
      ...frontmatter,
      hastString,
      headings: hastVfile.data.astro?.headings,
      readingTime: hastVfile.data.astro?.frontmatter?.readingTime,
    },
  };
};
