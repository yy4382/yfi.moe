import * as stylex from "@stylexjs/stylex";
import type { LayeredCommentData } from "@repo/api/comment/get.model";
import {
  colors,
  radii,
  shadows,
  spacing,
} from "@repo/design-tokens/tokens.stylex";
import { useChildrenQuery } from "../hooks/use-children-query";
import { CommentItem } from "./comment-item";

export function CommentParent({
  parentComment,
}: {
  parentComment: LayeredCommentData;
}) {
  const { data, hasNextPage, fetchNextPage } = useChildrenQuery(parentComment);

  return (
    <div {...stylex.props(styles.root)}>
      <CommentItem comment={parentComment.data} />
      {parentComment.children.total > 0 && (
        <div {...stylex.props(styles.children)}>
          {data.pages
            .flatMap((page) => page.data)
            .map((child) => {
              const replyToName =
                child.replyToId === parentComment.data.id
                  ? parentComment.data.displayName
                  : parentComment.children.data.find(
                      (candidate) => candidate.id === child.replyToId,
                    )?.displayName;
              return (
                <CommentItem
                  key={child.id}
                  comment={child}
                  replyToName={replyToName}
                />
              );
            })}
          {hasNextPage && (
            <div {...stylex.props(styles.center)}>
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                {...stylex.props(styles.loadButton)}
              >
                加载更多回复
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column" },
  children: { marginInlineStart: spacing.xl, paddingInlineStart: spacing.lg },
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
  },
});
