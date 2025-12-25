import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import type { LayeredCommentData } from "@repo/api/comment/get.model";
import { getCommentsChildrenResponse } from "@repo/api/comment/get.model";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { sortByAtom } from "../atoms";
import { PER_PAGE } from "../utils/constants";
import { commentKeys } from "../utils/query-keys";

/**
 * Hook for fetching paginated child comments of a parent.
 *
 * Features:
 * - Infinite scrolling with fetchNextPage
 * - Uses initial data from parent comment to avoid extra fetch
 * - Only fetches when there are more children to load
 */
export function useChildrenQuery(parentComment: LayeredCommentData) {
  const path = usePathname();
  const honoClient = useHonoClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);

  return useInfiniteQuery({
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
}
