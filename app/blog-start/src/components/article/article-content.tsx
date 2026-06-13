import type { ReactNode } from "react";
import type { MarkdownHeading } from "@repo/markdown/parse";
import ReadingProgress from "@/components/article/reading-progress";
import Toc from "@/components/article/toc/toc";

export function ArticleContent({
  headings,
  children,
}: {
  headings: MarkdownHeading[];
  children: ReactNode;
}) {
  return (
    <div className="border-b border-container">
      <div
        className="@container relative main-container grid h-full grid-cols-1"
        id="article-container"
      >
        <div className="pointer-events-none col-start-1 row-start-1">
          <ReadingProgress />
        </div>

        <div className="pointer-events-none col-start-1 row-start-1">
          <Toc headings={headings} />
        </div>

        <div className="col-start-1 row-start-1 px-4 py-18">
          <article
            id="article-content"
            className="mx-auto prose wrap-break-word prose-gray dark:prose-invert prose-headings:scroll-mt-8"
          >
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}
