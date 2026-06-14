import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { z } from "zod";
import { PostArticleRsc } from "@/components/article/post-article-rsc";
import type { PostArticleRscData } from "@/components/article/post-article-rsc";
import { getDesc } from "@/lib/content/get-description";
import {
  getAdjacentPosts,
  getImageMeta,
  getPost,
  getSeriesPosts,
  getSimilarPosts,
} from "@/lib/content/source";
import { toContentSummary } from "@/lib/content/summary";
import { getMarkdownHeadingList } from "@/lib/markdown/markdown.server";

export const getPostArticleRoute = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    const post = await getPost(slug);
    if (!post) {
      return undefined;
    }

    const [imageMeta, adjacent, similarPosts, seriesPosts, headings] =
      await Promise.all([
        getImageMeta(),
        getAdjacentPosts(post.id),
        getSimilarPosts(post.id),
        post.data.series
          ? getSeriesPosts(post.data.series.id)
          : Promise.resolve([]),
        Promise.resolve(getMarkdownHeadingList(post.body)),
      ]);

    const postSummary = toContentSummary(post);
    const articleData: PostArticleRscData = {
      post: postSummary,
      headings,
      imageMeta,
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

    return {
      kind: "post" as const,
      post: postSummary,
      seoDescription: post.data.description || getDesc(post.body),
      article: await renderServerComponent(
        <PostArticleRsc {...articleData} content={post.body} />,
      ),
    };
  });
