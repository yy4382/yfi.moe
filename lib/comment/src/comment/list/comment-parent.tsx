import * as stylex from "@stylexjs/stylex";
import type { LayeredCommentData } from "@repo/api/comment/get.model";
import { useChildrenQuery } from "../hooks/use-children-query";
import { CommentItem } from "./comment-item";
import { styles } from "./comment-parent.stylex";

interface CommentParentProps {
  parentComment: LayeredCommentData;
}

/**
 * Renders a parent comment with its child replies.
 * Supports loading more children with pagination.
 */
export function CommentParent({ parentComment }: CommentParentProps) {
  const {
    data: childrenData,
    hasNextPage,
    fetchNextPage,
  } = useChildrenQuery(parentComment);

  return (
    <div {...stylex.props(styles.root)}>
      <CommentItem comment={parentComment.data} />
      {parentComment.children.total > 0 && (
        <div {...stylex.props(styles.children)}>
          {childrenData.pages
            .map((page) => page.data)
            .flat()
            .map((child) => {
              const replyToName =
                child.replyToId === parentComment.data.id
                  ? parentComment.data.displayName
                  : parentComment.children.data.find(
                      (c) => c.id === child.replyToId,
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
            <div {...stylex.props(styles.loadMoreContainer)}>
              <button
                onClick={() => void fetchNextPage()}
                {...stylex.props(styles.loadMore)}
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
