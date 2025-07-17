import { ListLayout } from "@/components/elements/list-view/post-list-layout";
import { postCollection } from "@/lib/content-layer/collections";
import { notFound, redirect } from "next/navigation";
import { searchParamsCache } from "./search-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: tagEncoded } = await params;
  const tag = decodeURIComponent(tagEncoded);
  return {
    title: `Tag: ${tag}`,
    robots: {
      index: false,
    },
  };
}

export const revalidate = 86400;
interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag: tagEncoded } = await params;
  const tag = decodeURIComponent(tagEncoded);
  const { page = 1 } = searchParamsCache.parse(await searchParams);

  const posts = await postCollection.getCollection();
  const postsWithTag = posts.filter((post) => post.data.tags.includes(tag));

  if (postsWithTag.length === 0) {
    return notFound();
  }

  const postsPerPage = 20;
  const totalPosts = postsWithTag.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // Redirect if page is out of range
  if (page <= 0 || page > totalPages) {
    redirect(`/tags/${encodeURIComponent(tag)}`);
  }

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = postsWithTag.slice(startIndex, endIndex);

  return (
    <ListLayout
      title={`Tag: ${tag}`}
      posts={paginatedPosts}
      currentPage={page}
      totalPages={totalPages}
      baseUrl={`/tags/${encodeURIComponent(tag)}`}
    />
  );
}
