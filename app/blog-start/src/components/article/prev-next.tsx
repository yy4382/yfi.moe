import { Link } from "@tanstack/react-router";
import type { ContentEntry, PostData } from "@/lib/content/source";
import { cn } from "@/lib/utils/cn";

export function PrevNext({
  prev,
  next,
}: {
  prev?: ContentEntry<PostData>;
  next?: ContentEntry<PostData>;
}) {
  if (!prev && !next) {
    return null;
  }

  return (
    <div className="border-b border-container">
      <div
        className={cn(
          "main-container grid items-stretch",
          prev && next && "grid-cols-1 lg:grid-cols-2",
          prev && !next && "grid-cols-1",
          !prev && next && "grid-cols-1",
        )}
      >
        {prev && (
          <div className="group @container">
            <Link
              className={cn([
                "flex h-full items-center",
                "border-container",
                "color-transition-card-btn",
                "gap-4 px-6 py-6 @lg:gap-8 @lg:px-16 @lg:py-8",
                "border-b lg:border-r lg:border-b-0",
              ])}
              to="/post/$slug"
              params={{ slug: prev.id }}
            >
              <div className="flex size-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 transition-all duration-200 group-hover:border-accent/30 group-hover:bg-accent/20">
                <span className="i-lucide-chevron-left size-9 shrink-0 transition-transform group-hover:scale-120 group-active:scale-95" />
              </div>
              <div>
                <p className="text-sm text-comment">上一篇</p>
                <p className="@lg:text-lg">{prev.data.title}</p>
              </div>
            </Link>
          </div>
        )}
        {next && (
          <div className="group @container">
            <Link
              className={cn([
                "flex h-full flex-row-reverse items-center",
                "border-container",
                "color-transition-card-btn",
                "gap-4 px-6 py-6 @lg:gap-8 @lg:px-16 @lg:py-8",
              ])}
              to="/post/$slug"
              params={{ slug: next.id }}
            >
              <div className="flex size-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 transition-all duration-200 group-hover:border-accent/30 group-hover:bg-accent/20">
                <span className="i-lucide-chevron-right size-9 shrink-0 transition-transform group-hover:scale-120 group-active:scale-95" />
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm text-comment">下一篇</p>
                <p className="@lg:text-lg">{next.data.title}</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
