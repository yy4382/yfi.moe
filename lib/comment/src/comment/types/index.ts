import type { WritableAtom } from "jotai";

/** Sort options for comment list */
export type SortBy = "created_desc" | "created_asc";

/** Identifies a comment box instance for mutations */
export interface CommentBoxId {
  parentId?: number;
  replyingTo?: number;
  editId?: number;
  path: string;
}

/** Props for reply context in CommentBoxNew */
export interface ReplyContext {
  parentId: number;
  replyToId: number;
  at?: string;
  onCancel?: () => void;
}

/** Jotai atom type for form content */
export type ContentAtom = WritableAtom<string, [string], void>;

/** Jotai atom type for anonymous checkbox */
export type IsAnonymousAtom = WritableAtom<boolean, [boolean], void>;
