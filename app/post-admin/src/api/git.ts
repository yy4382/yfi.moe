import type { GitStatus } from "../types/post";
import { apiClient } from "./client";

export async function fetchGitStatus(): Promise<GitStatus> {
  const data = await apiClient<{ status: GitStatus }>("/git/status");
  return data.status;
}

export async function syncGit(): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/git/sync", {
    method: "POST",
  });
}
