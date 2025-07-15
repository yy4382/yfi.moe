import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const HIDDEN = -1;
  const ADJ_DIST = 2;
  const VISIBLE = ADJ_DIST * 2 + 1;

  // Calculate visible page numbers
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

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();

    // Copy existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });

    // Add page param if not first page
    if (page > 1) {
      params.set("page", page.toString());
    }

    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  const prevPage = currentPage > 1 ? currentPage - 1 : undefined;
  const nextPage = currentPage < totalPages ? currentPage + 1 : undefined;

  return (
    <Card padding="sm">
      <div className={`flex flex-row justify-center gap-3 ${className}`}>
        <a
          href={prevPage ? buildPageUrl(prevPage) : undefined}
          aria-label={prevPage ? "Previous Page" : undefined}
          className={`flex size-12 items-center justify-center overflow-hidden transition-colors rounded-full ${
            prevPage
              ? "text-content hover:bg-primary/10"
              : "text-content/50 cursor-not-allowed"
          }`}
        >
          {prevPage ? (
            <ChevronLeft size={24} />
          ) : (
            <ChevronLeft size={24} className="opacity-50" />
          )}
        </a>

        <div className="flex flex-row items-center gap-2 bg-none font-bold text-content">
          {pages.map((p, index) => {
            if (p === HIDDEN) {
              return (
                <MoreHorizontal
                  key={`ellipsis-${index}`}
                  className="mx-1"
                  size={20}
                />
              );
            }

            if (p === currentPage) {
              return (
                <div
                  key={p}
                  className="flex size-9 items-center justify-center rounded-full bg-primary/20"
                >
                  {p}
                </div>
              );
            }

            return (
              <a
                key={p}
                href={buildPageUrl(p)}
                aria-label={`Page ${p}`}
                className="flex size-9 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
              >
                {p}
              </a>
            );
          })}
        </div>

        <a
          href={nextPage ? buildPageUrl(nextPage) : undefined}
          aria-label={nextPage ? "Next Page" : undefined}
          className={`flex size-12 items-center justify-center overflow-hidden transition-colors rounded-full ${
            nextPage
              ? "text-content hover:bg-primary/10"
              : "text-content/50 cursor-not-allowed"
          }`}
        >
          {nextPage ? (
            <ChevronRight size={24} />
          ) : (
            <ChevronRight size={24} className="opacity-50" />
          )}
        </a>
      </div>
    </Card>
  );
}
