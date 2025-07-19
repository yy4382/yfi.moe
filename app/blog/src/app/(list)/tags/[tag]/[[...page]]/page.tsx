import { ListLayout } from "../../../post-list-layout";
import { postCollection } from "@/lib/content-layer/collections";
import { notFound, redirect } from "next/navigation";
import { pagination, paginationPageFromParams } from "@/lib/utils/pagination";
import { Metadata } from "next";

const postsPerPage = 20;

export const revalidate = 86400;
export const dynamic = "error";
export async function generateStaticParams() {
  const posts = await postCollection.getCollection();
  const tags = posts.map((post) => post.data.tags).flat();
  const uniqueTags = [...new Set(tags)];
  const nestedParams = uniqueTags
    .map((tag) => {
      const postsWithTag = posts.filter((post) => post.data.tags.includes(tag));
      const { totalPages } = pagination(postsWithTag, postsPerPage);
      return {
        tag,
        page: Array.from({ length: totalPages }, (_, i) => i + 1),
      };
    })
    .map(({ tag, page }) => {
      return page.map((page) => {
        return {
          tag,
          page: page === 1 ? undefined : [page.toString()],
        };
      });
    })
    .flat();
  return nestedParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string; page?: string[] }>;
}): Promise<Metadata> {
  const { tag: tagEncoded } = await params;
  const tag = decodeURIComponent(tagEncoded);
  return {
    title: `Tag: ${tag}`,
    robots: {
      index: false,
    },
  };
}

interface TagPageProps {
  params: Promise<{ tag: string; page?: string[] }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag: tagEncoded, page: pageParam } = await params;

  const tag = decodeURIComponent(tagEncoded);
  const page = paginationPageFromParams(pageParam, `/tags/${tag}`);

  const posts = await postCollection.getCollection();
  const postsWithTag = posts.filter((post) => post.data.tags.includes(tag));

  // no such tag
  if (postsWithTag.length === 0) {
    return notFound();
  }

  const { paginator, totalPages } = pagination(postsWithTag, postsPerPage);
  const paginatedPosts = paginator(page);

  // page out of range
  if (!paginatedPosts) {
    return redirect(`/tags`);
  }

  return (
    <ListLayout
      title={`Tag: ${tag}`}
      posts={paginatedPosts}
      currentPage={page}
      totalPages={totalPages}
      baseUrl={`/tags/${tag}`}
    />
  );
}
