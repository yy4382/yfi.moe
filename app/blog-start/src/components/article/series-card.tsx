import { Link } from "@tanstack/react-router";
import { Section } from "@/components/ui/section";
import type { ContentSummary, PostData } from "@/lib/content/source";

export function SeriesCard({
  seriesPosts,
  currentSlug,
}: {
  seriesPosts: ContentSummary<PostData>[];
  currentSlug: string;
}) {
  if (seriesPosts.length <= 1) {
    return null;
  }

  return (
    <Section className="py-10" padding="article">
      <div className="mx-auto max-w-prose">
        <div className="mb-4 flex items-center gap-2">
          <span className="i-lucide-list size-4 shrink-0" />
          <h3 className="text-base font-semibold">{"系列文章"}</h3>
        </div>
        <ol className="m-0 list-none space-y-3 p-0">
          {seriesPosts.map((post, index) => {
            const isCurrent = post.id === currentSlug;
            return (
              <li key={post.id} className="m-0 p-0">
                {isCurrent ? (
                  <div className="flex items-start gap-2 leading-relaxed font-medium text-accent-foreground">
                    <span className="shrink-0 font-normal text-comment">
                      {index + 1}.
                    </span>
                    <span>{post.data.title}</span>
                  </div>
                ) : (
                  <Link
                    to="/post/$slug"
                    params={{ slug: post.id }}
                    className="flex items-start gap-2 leading-relaxed no-underline transition-colors hover:text-accent-foreground"
                  >
                    <span className="shrink-0 text-comment">{index + 1}.</span>
                    <span>{post.data.title}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
