import type { ReactNode } from "react";
import { ArticleHero } from "@/components/article/article-hero";
import { CommentSection } from "@/components/comments/comment-section";
import { NavLayout } from "@/components/layout/nav-layout";

export function PageShell({
  title,
  children,
  useComment,
  pathname,
}: {
  title: string;
  children: ReactNode;
  useComment?: boolean;
  pathname: string;
}) {
  return (
    <NavLayout>
      <ArticleHero title={title} />
      <div className="border-b border-container">
        <div className="main-container h-full">
          <div className="px-4 py-18">
            <div className="mx-auto prose wrap-break-word prose-gray dark:prose-invert prose-headings:scroll-mt-8">
              {children}
            </div>
          </div>
        </div>
      </div>
      {useComment && <CommentSection pathname={pathname} />}
    </NavLayout>
  );
}
