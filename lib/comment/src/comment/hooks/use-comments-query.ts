import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { produce } from "immer";
import { useAtomValue } from "jotai";
import type { User } from "@repo/api/auth/client";
import { getCommentsResponse } from "@repo/api/comment/get.model";
import type { HonoClient } from "@/lib/api/create-client";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { sortByAtom, SORT_BY_OPTIONS } from "../atoms";
import { PER_PAGE } from "../utils/constants";
import { commentKeys } from "../utils/query-keys";

/**
 * Creates infinite query options for fetching paginated comments.
 */
function createListOptions(
  user: User | undefined,
  path: string,
  sortBy: (typeof SORT_BY_OPTIONS)[number],
  honoClient: HonoClient,
) {
  return infiniteQueryOptions({
    queryKey: commentKeys.list(user?.id, path, sortBy),
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      try {
        const result = await honoClient.comments.get.$post({
          json: {
            path,
            limit: PER_PAGE,
            cursor: pageParam,
            sortBy,
          },
        });
        if (!result.ok) {
          throw new Error(await result.text());
        }
        return getCommentsResponse.decode(await result.json());
      } catch {
        throw new Error("网络请求失败");
      }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.cursor : undefined;
    },
    // When switching sort order, reverse the existing data as a placeholder
    placeholderData: (previousData, previousQuery) => {
      if (previousQuery?.queryKey[3] === sortBy) {
        return previousData;
      }
      if (!previousData) {
        return previousData;
      }
      return produce(previousData, (draft) => {
        draft.pages.reverse();
        draft.pages.forEach((page) => page.comments.reverse());
      });
    },
  });
}

/**
 * Hook for fetching paginated comments for the current page.
 *
 * Supports:
 * - Infinite scrolling with fetchNextPage
 * - Sort order switching (newest/oldest first)
 * - Placeholder data when switching sort order
 */
export function useCommentsQuery() {
  const path = usePathname();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);
  const honoClient = useHonoClient();

  return useInfiniteQuery(
    createListOptions(session?.user, path, sortBy, honoClient),
  );
}
