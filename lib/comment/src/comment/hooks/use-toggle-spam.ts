import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleSpamResponse } from "@repo/api/comment/toggle-spam.model";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { commentKeys } from "../utils/query-keys";

/**
 * Hook for toggling spam status on comments.
 *
 * Admin-only mutation for marking comments as spam or not spam.
 * Invalidates comment queries on success.
 */
export function useToggleSpam() {
  const path = usePathname();
  const queryClient = useQueryClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const honoClient = useHonoClient();

  const mutation = useMutation({
    mutationFn: async ({ id, isSpam }: { id: number; isSpam: boolean }) => {
      if (!session) {
        throw new Error("请先登录");
      }
      const result = await honoClient.comments["toggle-spam"].$post({
        json: { id, isSpam },
      });
      if (!result.ok) {
        throw new Error(await result.text());
      }
      return toggleSpamResponse.decode(await result.json());
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
