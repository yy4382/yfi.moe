import { ListLayout } from "../../post-list-layout";
import { postCollection } from "@/lib/content-layer/collections";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { pagination, paginationPageFromParams } from "@/lib/utils/pagination";

const postsPerPage = 20;

export const metadata: Metadata = {
  title: "Blog",
  robots: {
    index: false,
  },
};
export const revalidate = 86400;
export const dynamic = "error";
export async function generateStaticParams() {
  const posts = await postCollection.getCollection();
  const { totalPages } = pagination(posts, postsPerPage);
  const params = Array.from({ length: totalPages }, (_, i) =>
    i === 0 ? undefined : [(i + 1).toString()],
  ).map((page) => ({ page }));
  return params;
}

export default async function PostListPage({
  params,
}: {
  params: Promise<{ page?: string[] }>;
}) {
  const { page: pageParam } = await params;

  const page = paginationPageFromParams(pageParam, "/posts");

  const allPosts = await postCollection.getCollection();

  const { paginator, totalPages } = pagination(allPosts, postsPerPage);
  const posts = paginator(page);
  if (!posts) {
    // page out of range
    redirect("/posts");
  }

  return (
    <ListLayout
      title="Blog"
      posts={posts}
      currentPage={page}
      totalPages={totalPages}
      baseUrl="/posts"
    />
  );
}
