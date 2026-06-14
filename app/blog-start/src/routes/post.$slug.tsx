import { createFileRoute, redirect } from "@tanstack/react-router";
import { getPostArticleRoute } from "@/components/article/post-article.functions";
import { CommentSection } from "@/components/comments/comment-section";
import { NavLayout } from "@/components/layout/nav-layout";
import { PostListLayout } from "@/components/posts/post-list-layout";
import { paginatePosts } from "@/lib/content/listing";
import { getSortedPosts } from "@/lib/content/server";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ params }) => {
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

    const postRoute = await getPostArticleRoute({ data: params.slug });
    if (!postRoute) {
      throw redirect({ to: "/404" });
    }

    return postRoute;
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
      {data.article}
      <CommentSection pathname={`/post/${post.id}`} />
    </NavLayout>
  );
}
