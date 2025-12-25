import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCommentResponse } from "@repo/api/comment/delete.model";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { commentKeys } from "../utils/query-keys";

/**
 * Hook for deleting user's own comments.
 *
 * Requires the user to be logged in.
 * Invalidates comment queries on success.
 */
export function useDeleteComment() {
  const path = usePathname();
  const queryClient = useQueryClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const honoClient = useHonoClient();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      if (!session) {
        throw new Error("请先登录");
      }
      const result = await honoClient.comments.delete.$post({ json: { id } });
      if (!result.ok) {
        throw new Error(await result.text());
      }
      return deleteCommentResponse.decode(await result.json());
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: commentKeys.all(session?.user.id, path),
      });
    },
  });

  return mutation;
}
