import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCommentResponse } from "@repo/api/comment/delete.model";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { useGuestIdentity } from "@/lib/hooks/guest-identity";
import { commentKeys } from "../utils/query-keys";

/**
 * Hook for deleting user's own comments.
 *
 * Invalidates comment queries on success.
 */
export function useDeleteComment() {
  const path = usePathname();
  const queryClient = useQueryClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const honoClient = useHonoClient();
  const { synchronize } = useGuestIdentity();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await honoClient.comments.delete.$post({ json: { id } });
      if (!result.ok) {
        throw new Error(await result.text());
      }
      return {
        response: deleteCommentResponse.decode(await result.json()),
        identityHeaders: result.headers,
      };
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: ({ identityHeaders }) => {
      synchronize(identityHeaders);
      void queryClient.invalidateQueries({
        queryKey: commentKeys.all(session?.user.id, path),
      });
    },
  });

  return mutation;
}
