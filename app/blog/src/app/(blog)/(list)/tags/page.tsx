import { ListHero } from "../post-list-layout";
import { Section } from "@/components/ui/section";
import { postCollection } from "@/lib/content-layer/collections";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tags",
  robots: {
    index: false,
  },
};

export const dynamic = "error";

export default function TagsPage() {
  return (
    <div>
      <ListHero title="Tags" />
      <Section className="@container p-0">
        <div className="px-6 @xl:px-10 @4xl:px-16 @6xl:px-32 py-10">
          <Suspense fallback={<div>Loading...</div>}>
            <TagCloud />
          </Suspense>
        </div>
      </Section>
    </div>
  );
}

async function TagCloud() {
  const posts = await postCollection.getCollection();
  const allTags = posts.reduce(
    (acc, post) => {
      post.data.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );
  return (
    <>
      {Object.entries(allTags)
        .sort(() => Math.random() - 0.5)
        .map(([tag, count]) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="transition-colors hover:text-accent-foreground mr-2"
            style={{ fontSize: `${2 - 1 / count}rem` }}
          >
            {tag}{" "}
            <span
              className="font-mono -ms-0.5"
              style={{
                opacity: 0.8,
                fontSize: `${(2 - 1 / count) * 0.75}rem`,
              }}
            >
              ({count})
            </span>
          </Link>
        ))}
    </>
  );
}
