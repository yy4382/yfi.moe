import {
  ArticleContent,
  ArticleHero,
} from "@/components/elements/article-view/article";
import { getPageCollection } from "@/lib/content-layer/collections";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParam } = await params;
  const pages = await getPageCollection();
  const page = pages.find((p) => p.id === pageParam);
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

  const pages = await getPageCollection();
  const page = pages.find((p) => p.id === pageParam);
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
