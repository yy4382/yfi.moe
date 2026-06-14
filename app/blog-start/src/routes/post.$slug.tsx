import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArticleContent } from "@/components/article/article-content";
import { ArticleHero } from "@/components/article/article-hero";
import { CopyrightCard } from "@/components/article/copyright-card";
import { PrevNext } from "@/components/article/prev-next";
import { SeriesCard } from "@/components/article/series-card";
import { SimilarPosts } from "@/components/article/similar-posts";
import { CommentSection } from "@/components/comments/comment-section";
import { NavLayout } from "@/components/layout/nav-layout";
import { renderMarkdownArticle } from "@/components/markdown/markdown.functions";
import type { PostListItemData } from "@/components/posts/post-list-item";
import { PostListLayout } from "@/components/posts/post-list-layout";
import type { PaginationPage } from "@/components/posts/post-list-layout";
import { Section } from "@/components/ui/section";
import { getDesc } from "@/lib/content/get-description";
import { paginatePosts } from "@/lib/content/listing";
import {
  getAdjacentPosts,
  getImageMeta,
  getPost,
  getSeriesPosts,
  getSimilarPosts,
  getSortedPosts,
} from "@/lib/content/server";
import type {
  ContentEntry,
  ContentSummary,
  PostData,
} from "@/lib/content/source";
import { getMarkdownHeadings } from "@/lib/markdown/server-functions";
import { getPrerenderedLoaderData } from "@/lib/routing/prerender-data";
import { buildSeo } from "@/lib/utils/seo";

type PostSlugLoaderData =
  | {
      kind: "list";
      page: PaginationPage<PostListItemData>;
    }
  | {
      kind: "post";
      post: ContentSummary<PostData>;
      seoDescription: string;
      headings: Awaited<ReturnType<typeof getMarkdownHeadings>>;
      markdown: Awaited<ReturnType<typeof renderMarkdownArticle>>;
      adjacent: {
        prev?: ContentSummary<PostData>;
        next?: ContentSummary<PostData>;
      };
      similarPosts: { post: ContentSummary<PostData>; score: number }[];
      seriesPosts: ContentSummary<PostData>[];
    };

function toContentSummary<TData>(
  entry: ContentEntry<TData>,
): ContentSummary<TData> {
  return {
    id: entry.id,
    data: entry.data,
  };
}

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ params }) => {
    const prerendered = getPrerenderedLoaderData<PostSlugLoaderData>();
    if (prerendered) {
      return prerendered;
    }

    if (/^\d+$/.test(params.slug)) {
      const currentPage = Number(params.slug);
      const posts = await getSortedPosts();
      const page = await paginatePosts(posts, currentPage);
      if (currentPage < 1 || currentPage > page.lastPage) {
        throw redirect({ to: "/404" });
      }
      return {
        kind: "list" as const,
        page,
      };
    }

    const post = await getPost({ data: params.slug });
    if (!post) {
      throw redirect({ to: "/404" });
    }

    const [imageMeta, adjacent, similarPosts, seriesPosts] = await Promise.all([
      getImageMeta(),
      getAdjacentPosts({ data: post.id }),
      getSimilarPosts({ data: { currentSlug: post.id } }),
      post.data.series
        ? getSeriesPosts({ data: { seriesId: post.data.series.id } })
        : Promise.resolve([]),
    ]);
    const markdown = await renderMarkdownArticle({
      data: {
        content: post.body,
        imageMeta,
      },
    });

    return {
      kind: "post" as const,
      post: toContentSummary(post),
      seoDescription: post.data.description || getDesc(post.body),
      headings: await getMarkdownHeadings({ data: { content: post.body } }),
      markdown,
      adjacent: {
        prev: adjacent.prev ? toContentSummary(adjacent.prev) : undefined,
        next: adjacent.next ? toContentSummary(adjacent.next) : undefined,
      },
      similarPosts: similarPosts.map(({ post, score }) => ({
        post: toContentSummary(post),
        score,
      })),
      seriesPosts: seriesPosts.map(toContentSummary),
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData || loaderData.kind === "list") {
      return buildSeo({
        title: "文章列表",
        noindex: true,
        canonical: `https://yfi.moe/post/${params.slug}`,
      });
    }
    const post = loaderData.post;
    const canonical = `https://yfi.moe/post/${post.id}`;
    return buildSeo({
      title: post.data.title,
      description: loaderData.seoDescription,
      image: post.data.image
        ? new URL(post.data.image, canonical).toString()
        : `${canonical}/og.png`,
      type: "article",
      canonical,
    });
  },
  component: PostSlugPage,
});

function PostSlugPage() {
  const data = Route.useLoaderData();
  if (data.kind === "list") {
    const { page } = data;
    return (
      <NavLayout>
        <PostListLayout
          paginationPage={page}
          baseUrl="/post"
          title="文章列表"
          desc={`共 ${page.total} 篇。${page.lastPage !== 1 ? `第 ${page.currentPage} / ${page.lastPage} 页。` : ""}`}
        />
      </NavLayout>
    );
  }

  const { post } = data;
  return (
    <NavLayout postInfo={{ title: post.data.title, tags: post.data.tags }}>
      <ArticleHero
        title={post.data.title}
        time={post.data}
        tags={post.data.tags}
      />
      {post.data.series && (
        <SeriesCard seriesPosts={data.seriesPosts} currentSlug={post.id} />
      )}
      <ArticleContent headings={data.headings}>
        {data.markdown.Renderable}
      </ArticleContent>
      {post.data.copyright && (
        <>
          <CopyrightCard />
          <Section className="bg-grid min-h-12" />
        </>
      )}
      {post.data.series && (
        <>
          <SeriesCard seriesPosts={data.seriesPosts} currentSlug={post.id} />
          <Section className="bg-grid min-h-12" />
        </>
      )}
      <SimilarPosts similarPosts={data.similarPosts} />
      <Section className="bg-grid min-h-12" />
      <PrevNext prev={data.adjacent.prev} next={data.adjacent.next} />
      <CommentSection pathname={`/post/${post.id}`} />
    </NavLayout>
  );
}
