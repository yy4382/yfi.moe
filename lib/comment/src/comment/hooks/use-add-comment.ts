import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import {
  addComment,
  type CommentAddParamsBranded,
} from "@/lib/api/comment/add";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { sortByAtom } from "../atoms";
import type { CommentBoxId } from "../types";
import {
  addReplyToCache,
  addRootCommentToCache,
  type ChildCommentsData,
  type RootCommentsData,
} from "../utils/cache-updaters";
import {
  TOAST_DURATION_INFO,
  TOAST_DURATION_WARNING,
} from "../utils/constants";
import { commentKeys } from "../utils/query-keys";

export interface UseAddCommentOptions {
  /** Called after successful comment submission */
  onSuccess?: () => void;
  /** Identifies this comment box instance */
  id: CommentBoxId;
}

/**
 * Hook for adding new comments.
 *
 * Handles:
 * - Optimistic cache updates for root comments and replies
 * - Spam detection feedback (flagged comments need admin approval)
 * - First-time commenter notification opt-in toast
 * - Query invalidation on success
 */
export function useAddComment({ onSuccess, id }: UseAddCommentOptions) {
  const path = usePathname();
  const queryClient = useQueryClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);
  const honoClient = useHonoClient();

  const mutation = useMutation({
    mutationKey: commentKeys.mutations.add(id),
    mutationFn: (params: CommentAddParamsBranded) =>
      addComment(params, honoClient),
    onSuccess: (data) => {
      onSuccess?.();

      // Show warning for spam-flagged comments (require admin approval)
      if (data.isSpam) {
        toast.warning(
          "您的评论已被标记为可能的垃圾内容。管理员会对此进行二次审核，通过后会正常显示。",
          {
            duration: TOAST_DURATION_WARNING,
            description: "如果您认为这是误判，请联系管理员。",
          },
        );
      }

      // Show notification opt-in toast for first-time commenters
      const userEmail = data.data.visitorEmail ?? data.data.userEmail;
      if (userEmail && !data.isSpam) {
        showFirstTimeCommenterToast(userEmail);
      }

      // Update cache (skip for spam - requires admin approval first)
      if (!data.isSpam) {
        const sessionId = session?.user.id;
        if (!data.data.parentId) {
          // Root comment: add to first page
          queryClient.setQueryData(
            commentKeys.list(sessionId, path, sortBy),
            (old: RootCommentsData) => addRootCommentToCache(old, data.data),
          );
        } else {
          // Reply: add to parent's children
          queryClient.setQueryData(
            commentKeys.children(sessionId, path, sortBy, data.data.parentId),
            (old: ChildCommentsData) => addReplyToCache(old, data.data),
          );
        }
      }

      // Invalidate to sync with server
      void queryClient.invalidateQueries({
        queryKey: commentKeys.all(session?.user.id, path),
      });
    },
  });

  return mutation;
}

/**
 * Shows a one-time notification toast for first-time commenters.
 * Stores seen emails in localStorage to avoid repeat notifications.
 */
function showFirstTimeCommenterToast(email: string): void {
  const storageKey = "commented-emails";
  const storedEmails = localStorage.getItem(storageKey);
  const commentedEmails: string[] = storedEmails
    ? (JSON.parse(storedEmails) as string[])
    : [];

  if (!commentedEmails.includes(email)) {
    commentedEmails.push(email);
    localStorage.setItem(storageKey, JSON.stringify(commentedEmails));
    toast.info(
      "当有人回复您的评论时，您将收到邮件通知。如需取消订阅，可点击邮件中的退订链接。",
      { duration: TOAST_DURATION_INFO },
    );
  }
}
