import simpleGit, { type SimpleGit, type StatusResult } from "simple-git";
import { env } from "../../../env.js";

let git: SimpleGit | null = null;

function getGitInstance(): SimpleGit {
  if (!git) {
    git = simpleGit(env.POSTS_REPO_PATH);
  }
  return git;
}

export interface GitStatus {
  current: string | null;
  tracking: string | null;
  ahead: number;
  behind: number;
  modified: string[];
  created: string[];
  deleted: string[];
  staged: string[];
  isClean: boolean;
}

export async function getStatus(): Promise<GitStatus> {
  const g = getGitInstance();
  const status: StatusResult = await g.status();

  return {
    current: status.current,
    tracking: status.tracking,
    ahead: status.ahead,
    behind: status.behind,
    modified: status.modified,
    created: status.created,
    deleted: status.deleted,
    staged: status.staged,
    isClean: status.isClean(),
  };
}

export async function pullChanges(): Promise<{
  success: boolean;
  message: string;
}> {
  const g = getGitInstance();
  try {
    const result = await g.pull();
    return {
      success: true,
      message: `Pulled ${result.summary.changes} changes, ${result.summary.insertions} insertions, ${result.summary.deletions} deletions`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pull failed";
    return { success: false, message };
  }
}

export async function commitAndPush(
  message: string,
): Promise<{ success: boolean; message: string }> {
  const g = getGitInstance();

  try {
    // Stage all changes
    await g.add(".");

    // Check if there are changes to commit
    const status = await g.status();
    if (status.isClean()) {
      return { success: true, message: "No changes to commit" };
    }

    // Commit
    const commitResult = await g.commit(message);

    // Push
    await g.push();

    return {
      success: true,
      message: `Committed ${commitResult.summary.changes} files and pushed`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return { success: false, message };
  }
}

export async function sync(): Promise<{ success: boolean; message: string }> {
  // First pull
  const pullResult = await pullChanges();
  if (!pullResult.success) {
    return pullResult;
  }

  // Then commit and push local changes
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  const commitResult = await commitAndPush(`Update posts - ${timestamp}`);

  return commitResult;
}
