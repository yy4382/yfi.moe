import type { MarkdownHeading } from "@repo/markdown/parse";
import type { ImageMeta } from "@repo/markdown/plugins/rehype-image-metadata";
import { ArticleContent } from "@/components/article/article-content";
import { ArticleHero } from "@/components/article/article-hero";
import { renderArticleMarkdownReact } from "@/components/markdown/markdown-rsc";
import type { ContentSummary, PageData } from "@/lib/content/source";

export async function ContentPageRsc({
  page,
  content,
  headings,
  imageMeta,
}: {
  page: ContentSummary<PageData>;
  content: string;
  headings: MarkdownHeading[];
  imageMeta: ImageMeta[];
}) {
  const markdown = await renderArticleMarkdownReact({
    content,
    imageMeta,
  });

  return (
    <>
      <ArticleHero title={page.data.title} time={page.data} />
      <ArticleContent headings={headings}>{markdown}</ArticleContent>
    </>
  );
}
