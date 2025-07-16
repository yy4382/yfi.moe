import { getPostCollection } from "@/lib/content-layer/collections";
import { ListLayout } from "@/components/elements/list-view/post-list-layout";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Blog",
  robots: {
    index: false,
  },
};

interface PostListPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PostListPage({
  searchParams,
}: PostListPageProps) {
  const { page = 1 } = searchParamsCache.parse(await searchParams);
  const allPosts = (
    await getPostCollection({ includeDraft: false })
  ).toReversed();

  const postsPerPage = 20;
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // Redirect if page is out of range
  if (page <= 0 || page > totalPages) {
    redirect("/post");
  }

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const posts = allPosts.slice(startIndex, endIndex);

  return (
    <ListLayout
      title="Blog"
      posts={posts}
      currentPage={page}
      totalPages={totalPages}
      baseUrl="/post"
    />
  );
}
