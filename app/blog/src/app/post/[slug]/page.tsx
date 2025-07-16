import {
  ArticleContent,
  ArticleHero,
  CopyrightCard,
  PrevNext,
} from "@/components/elements/article-view/article";

import { getPostCollection } from "@/lib/content-layer/collections";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Comment from "@/components/elements/comment/comment-loader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts = (await getPostCollection({ includeDraft: false })).toReversed();
  const postIndex = posts.findIndex((p) => p.id === slug);
  const post = posts[postIndex];
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
  const posts = (await getPostCollection({ includeDraft: false })).toReversed();
  const postIndex = posts.findIndex((p) => p.id === slug);
  const post = posts[postIndex];
  const prev = postIndex > 0 ? posts[postIndex - 1] : undefined;
  const next = postIndex < posts.length - 1 ? posts[postIndex + 1] : undefined;
  if (!post) {
    return notFound();
  }
  return (
    <>
      <ArticleHero {...post.data} />
      <ArticleContent text={post.body} />
      {post.data.copyright && <CopyrightCard />}
      <PrevNext prev={prev} next={next} />
      <Comment />
    </>
  );
}
