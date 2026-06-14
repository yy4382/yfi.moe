import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArticleContent } from "@/components/article/article-content";
import { ArticleHero } from "@/components/article/article-hero";
import { NavLayout } from "@/components/layout/nav-layout";
import { renderMarkdownArticle } from "@/components/markdown/markdown.functions";
import { getImageMeta, getPage } from "@/lib/content/server";
import type {
  ContentEntry,
  ContentSummary,
  PageData,
} from "@/lib/content/source";
import { getMarkdownHeadings } from "@/lib/markdown/server-functions";
import { getPrerenderedLoaderData } from "@/lib/routing/prerender-data";
import { buildSeo } from "@/lib/utils/seo";

type DynamicPageLoaderData = {
  page: ContentSummary<PageData>;
  markdown: Awaited<ReturnType<typeof renderMarkdownArticle>>;
  headings: Awaited<ReturnType<typeof getMarkdownHeadings>>;
};

function toContentSummary<TData>(
  entry: ContentEntry<TData>,
): ContentSummary<TData> {
  return {
    id: entry.id,
    data: entry.data,
  };
}

export const Route = createFileRoute("/$page")({
  loader: async ({ params }) => {
    const prerendered = getPrerenderedLoaderData<DynamicPageLoaderData>();
    if (prerendered) {
      return prerendered;
    }

    const page = await getPage({ data: params.page });
    if (!page) {
      throw redirect({ to: "/404" });
    }
    const markdown = await renderMarkdownArticle({
      data: {
        content: page.body,
        imageMeta: await getImageMeta(),
      },
    });
    return {
      page: toContentSummary(page),
      markdown,
      headings: await getMarkdownHeadings({ data: { content: page.body } }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const { page } = loaderData;
    const canonical = `https://yfi.moe/${page.id}`;
    return buildSeo({
      title: page.data.title,
      description: page.data.description,
      image: page.data.image
        ? new URL(page.data.image, canonical).toString()
        : undefined,
      type: "article",
      canonical,
    });
  },
  component: DynamicPage,
});

function DynamicPage() {
  const { page, markdown, headings } = Route.useLoaderData();
  return (
    <NavLayout>
      <ArticleHero title={page.data.title} time={page.data} />
      <ArticleContent headings={headings}>{markdown.Renderable}</ArticleContent>
    </NavLayout>
  );
}
