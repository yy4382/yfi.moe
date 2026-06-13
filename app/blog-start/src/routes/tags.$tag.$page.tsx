import { createFileRoute, redirect } from "@tanstack/react-router";
import { NavLayout } from "@/components/layout/nav-layout";
import type { PostListItemData } from "@/components/posts/post-list-item";
import type { PaginationPage } from "@/components/posts/post-list-layout";
import { PostListLayout } from "@/components/posts/post-list-layout";
import { groupPostsByTag, paginatePosts } from "@/lib/content/listing";
import { getSortedPosts } from "@/lib/content/server";
import { getPrerenderedLoaderData } from "@/lib/routing/prerender-data";
import { buildSeo } from "@/lib/utils/seo";

type TagPageLoaderData = {
  page: PaginationPage<PostListItemData>;
  tag: string;
};

export const Route = createFileRoute("/tags/$tag/$page")({
  loader: async ({ params }) => {
    const prerendered = getPrerenderedLoaderData<TagPageLoaderData>();
    if (prerendered) {
      return prerendered;
    }

    const currentPage = Number(params.page);
    if (!Number.isInteger(currentPage)) {
      throw redirect({ to: "/404" });
    }
    const postsByTag = groupPostsByTag(await getSortedPosts());
    const posts = postsByTag[params.tag];
    if (!posts) {
      throw redirect({ to: "/404" });
    }
    const page = paginatePosts(posts, currentPage);
    if (currentPage < 1 || currentPage > page.lastPage) {
      throw redirect({ to: "/404" });
    }
    return {
      page,
      tag: params.tag,
    };
  },
  head: ({ params }) =>
    buildSeo({
      title: `Tag: ${params.tag}`,
      noindex: true,
      canonical: `https://yfi.moe/tags/${params.tag}/${params.page}`,
    }),
  component: TagPage,
});

function TagPage() {
  const { page, tag } = Route.useLoaderData();
  return (
    <NavLayout>
      <PostListLayout
        title={`Tag: ${tag}`}
        paginationPage={page}
        baseUrl={`/tags/${tag}`}
      />
    </NavLayout>
  );
}
