import { createFileRoute } from "@tanstack/react-router";
import { NavLayout } from "@/components/layout/nav-layout";
import { PostListLayout } from "@/components/posts/post-list-layout";
import { paginatePosts } from "@/lib/content/listing";
import { getSortedPosts } from "@/lib/content/server";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/post/")({
  loader: async () => {
    const posts = await getSortedPosts();
    const page = await paginatePosts(posts, 1);
    return { page };
  },
  head: () =>
    buildSeo({
      title: "文章列表",
      noindex: true,
      canonical: "https://yfi.moe/post",
    }),
  component: PostIndexPage,
});

function PostIndexPage() {
  const { page } = Route.useLoaderData();
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
