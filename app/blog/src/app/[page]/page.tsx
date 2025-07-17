import {
  ArticleContent,
  ArticleHero,
} from "@/components/elements/article-view/article";
import { pageCollection } from "@/lib/content-layer/collections";
import { notFound } from "next/navigation";
import { cache } from "react";

const getEntry = cache((slug: string) => pageCollection.getEntry(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParam } = await params;
  const page = await getEntry(pageParam);
  if (!page) {
    return notFound();
  }
  return {
    title: page.data.title,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParam } = await params;

  const prefStart = performance.now();
  const page = await getEntry(pageParam);
  const prefEnd = performance.now();
  console.debug("[Page] page fetch time", pageParam, prefEnd - prefStart, "ms");
  if (!page) {
    return notFound();
  }
  return (
    <>
      <ArticleHero {...page.data} />
      <ArticleContent text={page.body} />
    </>
  );
}
