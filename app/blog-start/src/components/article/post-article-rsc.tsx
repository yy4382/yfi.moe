import type { ReactNode } from "react";
import type { MarkdownHeading } from "@repo/markdown/parse";
import type { ImageMeta } from "@repo/markdown/plugins/rehype-image-metadata";
import { ArticleContent } from "@/components/article/article-content";
import { ArticleHero } from "@/components/article/article-hero";
import { CopyrightCard } from "@/components/article/copyright-card";
import { PrevNext } from "@/components/article/prev-next";
import { SeriesCard } from "@/components/article/series-card";
import { SimilarPosts } from "@/components/article/similar-posts";
import { renderArticleMarkdownReact } from "@/components/markdown/markdown-rsc";
import { Section } from "@/components/ui/section";
import type { ContentSummary, PostData } from "@/lib/content/source";

export type PostArticleRscData = {
  post: ContentSummary<PostData>;
  headings: MarkdownHeading[];
  imageMeta: ImageMeta[];
  adjacent: {
    prev?: ContentSummary<PostData>;
    next?: ContentSummary<PostData>;
  };
  similarPosts: { post: ContentSummary<PostData>; score: number }[];
  seriesPosts: ContentSummary<PostData>[];
};

export async function PostArticleRsc({
  post,
  content,
  headings,
  imageMeta,
  adjacent,
  similarPosts,
  seriesPosts,
}: PostArticleRscData & { content: string }) {
  const markdown = await renderArticleMarkdownReact({
    content,
    imageMeta,
  });

  return (
    <PostArticleSurface
      post={post}
      headings={headings}
      markdown={markdown}
      adjacent={adjacent}
      similarPosts={similarPosts}
      seriesPosts={seriesPosts}
    />
  );
}

function PostArticleSurface({
  post,
  headings,
  markdown,
  adjacent,
  similarPosts,
  seriesPosts,
}: Omit<PostArticleRscData, "imageMeta"> & { markdown: ReactNode }) {
  return (
    <>
      <ArticleHero
        title={post.data.title}
        time={post.data}
        tags={post.data.tags}
      />
      {post.data.series && (
        <SeriesCard seriesPosts={seriesPosts} currentSlug={post.id} />
      )}
      <ArticleContent headings={headings}>{markdown}</ArticleContent>
      {post.data.copyright && (
        <>
          <CopyrightCard />
          <Section className="bg-grid min-h-12" />
        </>
      )}
      {post.data.series && (
        <>
          <SeriesCard seriesPosts={seriesPosts} currentSlug={post.id} />
          <Section className="bg-grid min-h-12" />
        </>
      )}
      <SimilarPosts similarPosts={similarPosts} />
      <Section className="bg-grid min-h-12" />
      <PrevNext prev={adjacent.prev} next={adjacent.next} />
    </>
  );
}
