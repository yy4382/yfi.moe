import { ArticleContent, ArticleHero } from "../article";
import { pageCollection } from "@/lib/content-layer/collections";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Metadata } from "next";

const getEntry = cache((slug: string) => pageCollection.getEntry(slug));

export const revalidate = 86400;

export async function generateStaticParams() {
  const pages = await pageCollection.getCollection();
  return pages.map((page) => ({ page: page.id }));
}
export const dynamic = "error";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
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

  const page = await getEntry(pageParam);
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
