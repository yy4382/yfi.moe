import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Section } from "@/components/ui/section";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl: "/post" | `/tags/${string}`;
  className?: string;
};

const HIDDEN = -1;
const ADJ_DIST = 2;
const VISIBLE = ADJ_DIST * 2 + 1;

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);
  const prevPage = currentPage > 1 ? currentPage - 1 : undefined;
  const nextPage = currentPage < totalPages ? currentPage + 1 : undefined;

  return (
    <Section padding="sm">
      <div className={`flex flex-row justify-center gap-3 ${className}`}>
        <PageLink
          page={prevPage}
          baseUrl={baseUrl}
          ariaLabel={prevPage ? "Previous Page" : undefined}
          className={`flex size-12 items-center justify-center overflow-hidden rounded-full transition-colors ${
            prevPage
              ? "text-content hover:bg-accent hover:text-accent-foreground"
              : "cursor-not-allowed text-content/50"
          }`}
        >
          <span
            className={`i-lucide-chevron-left size-6 ${prevPage ? "" : "opacity-50"}`}
          />
        </PageLink>

        <div className="flex flex-row items-center gap-2 bg-none font-bold text-content">
          {pages.map((page, index) => {
            if (page === HIDDEN) {
              return (
                <span
                  key={`hidden-${index}`}
                  className="mx-1 i-lucide-more-horizontal size-5"
                />
              );
            }

            if (page === currentPage) {
              return (
                <div
                  key={page}
                  className="flex size-9 items-center justify-center rounded-full bg-primary/90 text-primary-foreground"
                >
                  {page}
                </div>
              );
            }

            return (
              <PageLink
                key={page}
                page={page}
                baseUrl={baseUrl}
                ariaLabel={`Page ${page}`}
                className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {page}
              </PageLink>
            );
          })}
        </div>

        <PageLink
          page={nextPage}
          baseUrl={baseUrl}
          ariaLabel={nextPage ? "Next Page" : undefined}
          className={`flex size-12 items-center justify-center overflow-hidden rounded-full transition-colors ${
            nextPage
              ? "text-content hover:bg-accent hover:text-accent-foreground"
              : "cursor-not-allowed text-content/50"
          }`}
        >
          <span
            className={`i-lucide-chevron-right size-6 ${nextPage ? "" : "opacity-50"}`}
          />
        </PageLink>
      </div>
    </Section>
  );
}

function PageLink({
  page,
  baseUrl,
  ariaLabel,
  className,
  children,
}: {
  page?: number;
  baseUrl: PaginationProps["baseUrl"];
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  if (!page) {
    return (
      <span aria-label={ariaLabel} className={className}>
        {children}
      </span>
    );
  }
  const href = page === 1 ? baseUrl : `${baseUrl}/${page}`;
  return (
    <Link to={href} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  let count = 1;
  let l = currentPage;
  let r = currentPage;

  while (0 < l - 1 && r + 1 <= totalPages && count + 2 <= VISIBLE) {
    count += 2;
    l--;
    r++;
  }

  while (0 < l - 1 && count < VISIBLE) {
    count++;
    l--;
  }

  while (r + 1 <= totalPages && count < VISIBLE) {
    count++;
    r++;
  }

  const pages: number[] = [];
  if (l > 1) pages.push(1);
  if (l === 3) pages.push(2);
  if (l > 3) pages.push(HIDDEN);

  for (let i = l; i <= r; i++) pages.push(i);

  if (r < totalPages - 2) pages.push(HIDDEN);
  if (r === totalPages - 2) pages.push(totalPages - 1);
  if (r < totalPages) pages.push(totalPages);

  return pages;
}
