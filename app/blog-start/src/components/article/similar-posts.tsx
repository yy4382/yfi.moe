import { Link } from "@tanstack/react-router";
import type { ContentEntry, PostData } from "@/lib/content/source";
import { cn } from "@/lib/utils/cn";

export function SimilarPosts({
  similarPosts,
}: {
  similarPosts: { post: ContentEntry<PostData>; score: number }[];
}) {
  if (similarPosts.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-container">
      <div className="main-container">
        <div className="border-b border-container px-6 py-4">
          <h2 className="text-lg font-medium">相关推荐</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {similarPosts.map(({ post }, index) => (
            <Link
              key={post.id}
              to="/post/$slug"
              params={{ slug: post.id }}
              className={cn([
                "group @container",
                "border-container color-transition-card-btn",
                "flex flex-col gap-2 px-6 py-6 @lg:px-8 @lg:py-8",
                index < similarPosts.length - 1 &&
                  "border-b md:border-r md:border-b-0",
              ])}
            >
              <h3 className="leading-snug font-medium transition-colors group-hover:text-accent-foreground">
                {post.data.title}
              </h3>
              {post.data.tags.length > 0 && (
                <div className="mt-auto flex items-center pt-2 text-sm text-comment select-none">
                  <span className="mr-1 i-lucide-hash size-4" />
                  <span className="space-x-0.5">
                    {post.data.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tag}>
                        {tagIndex !== 0 && <span>|</span>}
                        <span>{tag}</span>
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
