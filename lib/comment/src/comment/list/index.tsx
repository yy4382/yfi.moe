import * as stylex from "@stylexjs/stylex";
import { useAtom } from "jotai";
import { Fragment } from "react";
import { z, ZodError } from "zod";
import MingcuteLoadingLine from "~icons/mingcute/loading-line";
import { SORT_BY_LABELS, SORT_BY_OPTIONS, sortByAtom } from "../atoms";
import { useCommentsQuery } from "../hooks/use-comments-query";
import { CommentParent } from "./comment-parent";
import { styles } from "./index.stylex";

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
    return <div {...stylex.props(styles.message)}>加载评论中...</div>;
  }

  if (isError) {
    return (
      <div {...stylex.props(styles.error)}>
        加载评论失败:{" "}
        {error instanceof ZodError ? z.prettifyError(error) : error.message}
        <button onClick={() => void refetch()} {...stylex.props(styles.retry)}>
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
    return <div {...stylex.props(styles.message)}>暂无留言</div>;
  }

  return (
    <div {...stylex.props(styles.root)}>
      {/* Header with count and sort options */}
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.inline, styles.commentCount)}>
          <span>共{data.pages[0]!.total}条留言</span>
          {(isFetching || isFetchingNextPage) && (
            <span>
              <MingcuteLoadingLine {...stylex.props(styles.loadingIcon)} />
            </span>
          )}
        </div>
        <div {...stylex.props(styles.inline)}>
          {SORT_BY_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              {...stylex.props(
                styles.sort,
                sortBy !== option && styles.inactiveSort,
              )}
            >
              {SORT_BY_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {/* Comment list */}
      <div {...stylex.props(styles.list)}>
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
        <div {...stylex.props(styles.loadMoreContainer)}>
          <button
            onClick={() => void fetchNextPage()}
            disabled={isFetching}
            {...stylex.props(styles.loadMore)}
          >
            {isFetchingNextPage ? "正在加载..." : "加载更多"}
          </button>
        </div>
      )}

      <div {...stylex.props(styles.footer)}>
        {isFetching && !isFetchingNextPage ? "加载中..." : null}
      </div>
    </div>
  );
}
