import { createFileRoute, redirect } from "@tanstack/react-router";
import { NavLayout } from "@/components/layout/nav-layout";
import { PostListLayout } from "@/components/posts/post-list-layout";
import { groupPostsByTag, paginatePosts } from "@/lib/content/listing";
import { getSortedPosts } from "@/lib/content/server";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/tags/$tag")({
  loader: async ({ params }) => {
    const postsByTag = groupPostsByTag(await getSortedPosts());
    const posts = postsByTag[params.tag];
    if (!posts) {
      throw redirect({ to: "/404" });
    }
    return {
      page: await paginatePosts(posts, 1),
      tag: params.tag,
    };
  },
  head: ({ params }) =>
    buildSeo({
      title: `Tag: ${params.tag}`,
      noindex: true,
      canonical: `https://yfi.moe/tags/${params.tag}`,
    }),
  component: TagIndexPage,
});

function TagIndexPage() {
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
