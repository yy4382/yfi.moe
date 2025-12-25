import clsx from "clsx";
import { useAtom } from "jotai";
import { Fragment } from "react";
import { z, ZodError } from "zod";
import MingcuteLoadingLine from "~icons/mingcute/loading-line";
import { SORT_BY_LABELS, SORT_BY_OPTIONS, sortByAtom } from "../atoms";
import { useCommentsQuery } from "../hooks/use-comments-query";
import { CommentParent } from "./comment-parent";

// Re-export for tests
export { CommentItem } from "./comment-item";

/**
 * Renders the paginated list of comments for the current page.
 *
 * Features:
 * - Sort order toggle (newest/oldest first)
 * - Infinite scroll with "load more" button
 * - Loading and error states
 */
export function CommentList() {
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const {
    data,
    fetchNextPage,
    isPending,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = useCommentsQuery();

  if (isPending) {
    return (
      <div className="mt-6 p-4 text-center text-zinc-500">加载评论中...</div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 flex items-center justify-center-safe gap-2 p-4 text-center text-red-500">
        加载评论失败:{" "}
        {error instanceof ZodError ? z.prettifyError(error) : error.message}
        <button
          onClick={() => void refetch()}
          className="rounded-md border border-container px-2 py-1 text-comment shadow-md hover:scale-105 active:scale-95"
        >
          重试
        </button>
      </div>
    );
  }

  if (
    !data ||
    data.pages.length === 0 ||
    data.pages[0]!.comments.length === 0
  ) {
    return <div className="mt-6 p-4 text-center text-zinc-500">暂无留言</div>;
  }

  return (
    <div className="mt-10">
      {/* Header with count and sort options */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-comment">
          <span>共{data.pages[0]!.total}条留言</span>
          {(isFetching || isFetchingNextPage) && (
            <span>
              <MingcuteLoadingLine className="size-6 animate-spin" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {SORT_BY_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={clsx(
                "py-1 text-sm text-accent-foreground hover:scale-105 active:scale-95",
                sortBy !== option && "text-muted-foreground",
              )}
            >
              {SORT_BY_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {/* Comment list */}
      <div className="flex flex-col gap-4">
        {data.pages
          .map((page) => page.comments)
          .flat()
          .map((comment) => (
            <Fragment key={comment.data.id}>
              <CommentParent parentComment={comment} />
            </Fragment>
          ))}
      </div>

      {/* Load more button */}
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => void fetchNextPage()}
            disabled={isFetching}
            className="rounded-md border border-container px-2 py-1 text-comment shadow-md hover:scale-105 active:scale-95"
          >
            {isFetchingNextPage ? "正在加载..." : "加载更多"}
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-zinc-500">
        {isFetching && !isFetchingNextPage ? "加载中..." : null}
      </div>
    </div>
  );
}
