import { markdownToHtml } from "@repo/markdown/parse";
import { ArticlePresetFast } from "@repo/markdown/preset";
import type { PostListItemData } from "@/components/posts/post-list-item";
import type { PaginationPage } from "@/components/posts/post-list-layout";
import { getDesc } from "@/lib/content/get-description";
import type { ContentEntry, PostData } from "@/lib/content/source";

export const postPageSize = 15;

export function preparePostListItem(
  post: ContentEntry<PostData>,
): PostListItemData {
  const descriptionHtml =
    post.data.description ||
    markdownToHtml(getDesc(post.body), { preset: ArticlePresetFast });
  return {
    ...post,
    descriptionHtml,
  };
}

export function paginatePosts(
  posts: ContentEntry<PostData>[],
  currentPage: number,
  pageSize = postPageSize,
): PaginationPage<PostListItemData> {
  const total = posts.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (currentPage - 1) * pageSize;
  return {
    data: posts.slice(start, start + pageSize).map(preparePostListItem),
    currentPage,
    lastPage,
    total,
  };
}

export function groupPostsByTag(posts: ContentEntry<PostData>[]) {
  return posts.reduce(
    (acc, post) => {
      post.data.tags.forEach((tag) => {
        acc[tag] ??= [];
        acc[tag].push(post);
      });
      return acc;
    },
    {} as Record<string, ContentEntry<PostData>[]>,
  );
}
