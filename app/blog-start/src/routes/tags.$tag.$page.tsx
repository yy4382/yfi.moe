import { createFileRoute, redirect } from "@tanstack/react-router";
import { NavLayout } from "@/components/layout/nav-layout";
import { PostListLayout } from "@/components/posts/post-list-layout";
import { groupPostsByTag, paginatePosts } from "@/lib/content/listing";
import { getSortedPosts } from "@/lib/content/server";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/tags/$tag/$page")({
  loader: async ({ params }) => {
    const currentPage = Number(params.page);
    if (!Number.isInteger(currentPage)) {
      throw redirect({ to: "/404" });
    }
    const postsByTag = groupPostsByTag(await getSortedPosts());
    const posts = postsByTag[params.tag];
    if (!posts) {
      throw redirect({ to: "/404" });
    }
    const page = await paginatePosts(posts, currentPage);
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
