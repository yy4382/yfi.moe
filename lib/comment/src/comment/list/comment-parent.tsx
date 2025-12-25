import type { LayeredCommentData } from "@repo/api/comment/get.model";
import { useChildrenQuery } from "../hooks/use-children-query";
import { CommentItem } from "./comment-item";

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
    <div className="flex flex-col">
      <CommentItem comment={parentComment.data} />
      {parentComment.children.total > 0 && (
        <div className="ml-6 pl-4">
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
            <div className="flex justify-center">
              <button
                onClick={() => void fetchNextPage()}
                className="rounded-md border border-container px-2 py-1 text-comment shadow-md hover:scale-105 active:scale-95"
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
