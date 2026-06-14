import type { PostListItemData } from "@/components/posts/post-list-item";
import type { PaginationPage } from "@/components/posts/post-list-layout";
import type { ContentEntry, PostData } from "@/lib/content/source";
import { renderPostDescriptionHtml } from "@/lib/markdown/server-functions";

export const postPageSize = 15;

export function preparePostListItem(
  post: ContentEntry<PostData>,
  descriptionHtml: string,
): PostListItemData {
  return {
    id: post.id,
    data: post.data,
    descriptionHtml,
  };
}

export async function paginatePosts(
  posts: ContentEntry<PostData>[],
  currentPage: number,
  pageSize = postPageSize,
): Promise<PaginationPage<PostListItemData>> {
  const total = posts.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pagePosts = posts.slice(start, start + pageSize);
  const descriptions = await renderPostDescriptionHtml({
    data: {
      posts: pagePosts.map((post) => ({
        body: post.body,
        description: post.data.description,
      })),
    },
  });
  return {
    data: pagePosts.map((post, index) =>
      preparePostListItem(post, descriptions[index] ?? ""),
    ),
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
