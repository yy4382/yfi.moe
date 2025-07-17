import {
  ArticleContent,
  ArticleHero,
  CopyrightCard,
  PrevNext,
} from "@/components/elements/article-view/article";

import { postCollection } from "@/lib/content-layer/collections";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Comment from "@/components/elements/comment/comment-loader";
import { Suspense } from "react";
import { cache } from "react";

const getEntry = cache((slug: string) => postCollection.getEntry(slug));

export const revalidate = 86400;

export async function generateStaticParams() {
  const posts = await postCollection.getCollection();
  return posts.map((post) => ({ slug: post.id }));
}
export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getEntry(slug);
  if (!post) {
    return notFound();
  }
  return {
    title: post.data.title,
    description: post.data.description,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prefStart = performance.now();
  const post = await getEntry(slug);
  const prefEnd = performance.now();
  console.debug("[PostPage] post fetch time", slug, prefEnd - prefStart, "ms");
  if (prefEnd - prefStart > 50) {
    console.warn("[PostPage] post fetch time", slug, prefEnd - prefStart, "ms");
  }
  if (!post) {
    return notFound();
  }
  return (
    <>
      <ArticleHero {...post.data} />
      <ArticleContent text={post.body} />
      {post.data.copyright && <CopyrightCard />}
      <Suspense fallback={<div>Loading...</div>}>
        <PrevNextGetter id={slug} />
      </Suspense>
      <Comment />
    </>
  );
}

async function PrevNextGetter({ id }: { id: string }) {
  const prefStart = performance.now();
  const posts = await postCollection.getCollection();
  const prefEnd = performance.now();
  console.debug("[PrevNextGetter] fetch", id, prefEnd - prefStart, "ms");
  if (prefEnd - prefStart > 50) {
    console.warn("[PrevNextGetter] fetch", id, prefEnd - prefStart, "ms");
  }
  const postIndex = posts.findIndex((p) => p.id === id);
  const prev = postIndex > 0 ? posts[postIndex - 1] : undefined;
  const next = postIndex < posts.length - 1 ? posts[postIndex + 1] : undefined;
  return <PrevNext prev={prev} next={next} />;
}
