import { MaskIcon } from "#/components/ui/mask-icon";
import * as stylex from "@stylexjs/stylex";
import { useAtom } from "jotai";
import { z, ZodError } from "zod";
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import { SORT_BY_LABELS, SORT_BY_OPTIONS, sortByAtom } from "../atoms";
import { useCommentsQuery } from "../hooks/use-comments-query";
import { CommentParent } from "./comment-parent";

export { CommentItem } from "./comment-item";

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
    return <div {...stylex.props(styles.status)}>加载评论中...</div>;
  }

  if (isError) {
    return (
      <div {...stylex.props(styles.status, styles.error)}>
        加载评论失败:{" "}
        {error instanceof ZodError ? z.prettifyError(error) : error.message}
        <button
          type="button"
          onClick={() => void refetch()}
          {...stylex.props(styles.loadButton)}
        >
          重试
        </button>
      </div>
    );
  }

  if (!data?.pages[0]?.comments.length) {
    return <div {...stylex.props(styles.status)}>暂无留言</div>;
  }

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.count)}>
          <span>共{data.pages[0].total}条留言</span>
          {(isFetching || isFetchingNextPage) && (
            <MaskIcon
              name="loading-line"
              stylexStyle={[styles.loadingIcon, styles.spin]}
            />
          )}
        </div>
        <div {...stylex.props(styles.sort)}>
          {SORT_BY_OPTIONS.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setSortBy(option)}
              {...stylex.props(
                styles.sortButton,
                sortBy !== option && styles.sortInactive,
              )}
            >
              {SORT_BY_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <div {...stylex.props(styles.list)}>
        {data.pages
          .flatMap((page) => page.comments)
          .map((comment) => (
            <CommentParent key={comment.data.id} parentComment={comment} />
          ))}
      </div>

      {hasNextPage && (
        <div {...stylex.props(styles.center)}>
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetching}
            {...stylex.props(styles.loadButton)}
          >
            {isFetchingNextPage ? "正在加载..." : "加载更多"}
          </button>
        </div>
      )}

      <div {...stylex.props(styles.fetching)}>
        {isFetching && !isFetchingNextPage ? "加载中..." : null}
      </div>
    </div>
  );
}

const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

const styles = stylex.create({
  root: { marginTop: "2.5rem" },
  status: {
    color: colors.textMuted,
    marginTop: spacing.xl,
    padding: spacing.lg,
    textAlign: "center",
  },
  error: {
    alignItems: "center",
    color: colors.danger,
    display: "flex",
    gap: spacing.sm,
    justifyContent: "safe center",
  },
  header: {
    alignItems: "center",
    display: "flex",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  count: {
    alignItems: "center",
    color: colors.textSecondary,
    display: "flex",
    gap: spacing.sm,
  },
  sort: { alignItems: "center", display: "flex", gap: spacing.sm },
  sortButton: {
    backgroundColor: "transparent",
    border: 0,
    color: colors.accentText,
    cursor: "pointer",
    fontSize: typography.sizeSm,
    paddingBlock: spacing.xs,
    ":hover": { transform: "scale(1.05)" },
    ":active": { transform: "scale(0.95)" },
  },
  sortInactive: { color: colors.textMuted },
  list: { display: "flex", flexDirection: "column", gap: spacing.lg },
  center: { display: "flex", justifyContent: "center" },
  loadButton: {
    backgroundColor: "transparent",
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.md,
    color: colors.textSecondary,
    cursor: "pointer",
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    ":hover": { transform: "scale(1.05)" },
    ":active": { transform: "scale(0.95)" },
    ":disabled": { opacity: 0.5 },
  },
  fetching: {
    color: colors.textMuted,
    marginTop: spacing.xl,
    minHeight: "1.5rem",
    textAlign: "center",
  },
  loadingIcon: { height: "1.5rem", width: "1.5rem" },
  spin: {
    animationDuration: "800ms",
    animationIterationCount: "infinite",
    animationName: spin,
    animationTimingFunction: "linear",
  },
});
