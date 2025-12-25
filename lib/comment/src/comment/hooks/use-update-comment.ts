import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import type { PrimitiveAtom } from "jotai";
import { toast } from "sonner";
import {
  updateComment,
  type CommentUpdateParamsBranded,
} from "@/lib/api/comment/update";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { sortByAtom } from "../atoms";
import {
  updateCommentInChildCache,
  updateCommentInRootCache,
  type ChildCommentsData,
  type RootCommentsData,
} from "../utils/cache-updaters";
import { commentKeys } from "../utils/query-keys";

export interface UseUpdateCommentOptions {
  /** ID of the comment being edited */
  editId: number;
  /** Atom holding the content - will be cleared on success */
  contentAtom: PrimitiveAtom<string>;
  /** Called after successful update */
  onSuccess?: () => void;
}

/**
 * Hook for updating existing comments.
 *
 * Handles:
 * - Updating comment in both root and child caches
 * - Clearing the content atom on success
 * - Query invalidation for consistency
 */
export function useUpdateComment({
  editId,
  contentAtom,
  onSuccess,
}: UseUpdateCommentOptions) {
  const path = usePathname();
  const queryClient = useQueryClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);
  const setContent = useSetAtom(contentAtom);
  const honoClient = useHonoClient();

  const mutationKey = commentKeys.mutations.edit(editId);

  const mutation = useMutation({
    mutationKey,
    mutationFn: (params: CommentUpdateParamsBranded) =>
      updateComment(params, honoClient),
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: ({ data }) => {
      const sessionId = session?.user.id;

      // Update in root comments cache
      queryClient.setQueryData(
        commentKeys.list(sessionId, path, sortBy),
        (old: RootCommentsData) => updateCommentInRootCache(old, data),
      );

      // Also update in child cache if it's a reply
      if (data.parentId) {
        queryClient.setQueryData(
          commentKeys.children(sessionId, path, sortBy, data.parentId),
          (old: ChildCommentsData) => updateCommentInChildCache(old, data),
        );
      }

      // Invalidate to sync with server
      void queryClient.invalidateQueries({
        queryKey: commentKeys.all(sessionId, path),
      });

      // Clear form and notify
      setContent("");
      onSuccess?.();
    },
  });

  return { mutation, mutationKey };
}
