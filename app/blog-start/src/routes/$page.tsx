import { createFileRoute, redirect } from "@tanstack/react-router";
import { getContentPageRoute } from "@/components/article/content-page.functions";
import { NavLayout } from "@/components/layout/nav-layout";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/$page")({
  loader: async ({ params }) => {
    const pageRoute = await getContentPageRoute({ data: params.page });
    if (!pageRoute) {
      throw redirect({ to: "/404" });
    }
    return pageRoute;
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
  const { article } = Route.useLoaderData();
  return <NavLayout>{article}</NavLayout>;
}
