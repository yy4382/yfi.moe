import type { CommentBoxId, SortBy } from "../types";

/**
 * Centralized query key factory for all comment-related queries.
 * Ensures consistent key structure across the codebase.
 */
export const commentKeys = {
  /** Base key for all comment queries on a path */
  all: (sessionId: string | undefined, path: string) =>
    ["comments", { session: sessionId }, path] as const,

  /** Key for paginated root comment list */
  list: (sessionId: string | undefined, path: string, sortBy: SortBy) =>
    [...commentKeys.all(sessionId, path), sortBy] as const,

  /** Key for child comments of a specific parent */
  children: (
    sessionId: string | undefined,
    path: string,
    sortBy: SortBy,
    parentId: number,
  ) => [...commentKeys.list(sessionId, path, sortBy), parentId] as const,

  /** Mutation keys for optimistic updates */
  mutations: {
    add: (id: CommentBoxId) => ["addComment", id] as const,
    edit: (editId: number) => ["editComment", editId] as const,
  },
} as const;
