import { ListHero } from "@/components/elements/list-view/post-list-layout";
import { Card } from "@/components/ui/card";
import { getPostCollection } from "@/lib/content-layer/collections";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tags",
  robots: {
    index: false,
  },
};

export default async function TagsPage() {
  const posts = await getPostCollection({ includeDraft: false });
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
    <div>
      <ListHero title="Tags" />
      <Card className="@container p-0">
        <div className="px-6 @xl:px-10 @4xl:px-16 @6xl:px-32 py-10">
          {Object.entries(allTags)
            .sort(() => Math.random() - 0.5)
            .map(([tag, count]) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="transition-colors hover:text-content-primary mr-2"
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
        </div>
      </Card>
    </div>
  );
}
