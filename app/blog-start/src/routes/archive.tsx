import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { NavLayout } from "@/components/layout/nav-layout";
import { Section } from "@/components/ui/section";
import { getSortedPosts } from "@/lib/content/server";
import type {
  ContentEntry,
  ContentSummary,
  PostData,
} from "@/lib/content/source";
import { getPrerenderedLoaderData } from "@/lib/routing/prerender-data";
import { buildSeo } from "@/lib/utils/seo";

type ArchiveLoaderData = {
  total: number;
  groupedPosts: {
    year: string;
    posts: ContentSummary<PostData>[];
  }[];
};

function toContentSummary<TData>(
  entry: ContentEntry<TData>,
): ContentSummary<TData> {
  return {
    id: entry.id,
    data: entry.data,
  };
}

export const Route = createFileRoute("/archive")({
  loader: async () => {
    const prerendered = getPrerenderedLoaderData<ArchiveLoaderData>();
    if (prerendered) {
      return prerendered;
    }

    const posts = await getSortedPosts();
    const groupedPosts = posts.reduce<
      {
        year: string;
        posts: ContentSummary<PostData>[];
      }[]
    >((acc, post) => {
      const year = format(new Date(post.data.publishedDate), "yyyy");
      const summary = toContentSummary(post);
      const index = acc.findIndex((item) => item.year === year);
      if (index !== -1) {
        acc[index]!.posts.push(summary);
      } else {
        acc.push({ year, posts: [summary] });
      }
      return acc;
    }, []);
    groupedPosts.sort((a, b) => Number(b.year) - Number(a.year));
    return { total: posts.length, groupedPosts };
  },
  head: () =>
    buildSeo({
      title: "归档",
      description: "文章归档",
      noindex: true,
      canonical: "https://yfi.moe/archive",
    }),
  component: ArchivePage,
});

function ArchivePage() {
  const { total, groupedPosts } = Route.useLoaderData();
  return (
    <NavLayout>
      <Section
        className="flex h-52 flex-col items-start justify-center px-4 lg:h-96"
        bg="grid"
      >
        <div className="mx-auto w-full max-w-prose">
          <h1 className="text-5xl font-bold text-heading @3xl:text-6xl">
            归档
          </h1>
          <p className="mt-4 ml-1 text-lg text-content">共有 {total} 篇文章</p>
        </div>
      </Section>
      <Section className="px-4 py-18">
        <div className="mx-auto flex max-w-prose flex-col gap-8">
          {groupedPosts.map((group) => (
            <div key={group.year} className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">
                {group.year}{" "}
                <span className="text-sm font-normal text-comment">
                  ({group.posts.length})
                </span>
              </h2>
              <ul className="list-none text-sm lg:text-base">
                {group.posts.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center justify-between"
                  >
                    <span className="flex min-w-0 shrink items-center">
                      <span className="inline-block w-12 pr-2 font-light tabular-nums lg:w-16">
                        {format(new Date(post.data.publishedDate), "MM/dd")}
                      </span>
                      <Link
                        className="min-w-0 truncate py-0.5 leading-6 transition-colors hover:text-accent-foreground pointer-coarse:py-1"
                        to="/post/$slug"
                        params={{ slug: post.id }}
                      >
                        {post.data.title}
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </NavLayout>
  );
}
