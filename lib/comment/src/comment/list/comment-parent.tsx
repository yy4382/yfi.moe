import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import type { LayeredCommentData } from "@repo/api/comment/get.model";
import { getCommentsChildrenResponse } from "@repo/api/comment/get.model";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { sortByAtom } from "../atoms";
import { PER_PAGE } from "../utils/constants";
import { commentKeys } from "../utils/query-keys";
import { CommentItem } from "./comment-item";

interface CommentParentProps {
  parentComment: LayeredCommentData;
}

/**
 * Renders a parent comment with its child replies.
 * Supports loading more children with pagination.
 */
export function CommentParent({ parentComment }: CommentParentProps) {
  const path = usePathname();
  const honoClient = useHonoClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);

  const {
    data: childrenData,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: commentKeys.children(
      session?.user.id,
      path,
      sortBy,
      parentComment.data.id,
    ),
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const result = await honoClient.comments["get-children"].$post({
        json: {
          path,
          limit: PER_PAGE,
          cursor: pageParam,
          sortBy: "created_asc",
          rootId: parentComment.data.id,
        },
      });
      if (!result.ok) {
        throw new Error(await result.text());
      }
      return getCommentsChildrenResponse.decode(await result.json());
    },
    enabled: parentComment.children.hasMore,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.cursor : undefined;
    },
    initialData: {
      pages: [parentComment.children],
      pageParams: [undefined],
    },
    staleTime: 1000,
  });

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
