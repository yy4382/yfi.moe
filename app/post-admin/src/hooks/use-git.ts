import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGitStatus, syncGit } from "../api/git";

export function useGitStatus() {
  return useQuery({
    queryKey: ["git", "status"],
    queryFn: fetchGitStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useGitSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncGit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["git", "status"] });
    },
  });
}
