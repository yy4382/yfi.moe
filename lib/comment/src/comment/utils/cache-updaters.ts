import type { InfiniteData } from "@tanstack/react-query";
import { produce } from "immer";
import type { CommentData } from "@repo/api/comment/comment-data";
import type {
  GetCommentsChildrenResponse,
  GetCommentsResponse,
} from "@repo/api/comment/get.model";

/** Type for the root comments infinite query data */
export type RootCommentsData = InfiniteData<GetCommentsResponse>;

/** Type for child comments infinite query data */
export type ChildCommentsData = InfiniteData<GetCommentsChildrenResponse>;

/**
 * Adds a new root comment to the first page of the cache.
 * Increments the total count.
 */
export function addRootCommentToCache(
  old: RootCommentsData,
  newComment: CommentData,
): RootCommentsData {
  return produce(old, (draft) => {
    draft.pages[0]!.comments.unshift({
      data: newComment,
      children: { data: [], hasMore: false, cursor: 0, total: 0 },
    });
    draft.pages[0]!.total++;
  });
}

/**
 * Adds a reply to the last page of the parent's children.
 */
export function addReplyToCache(
  old: ChildCommentsData,
  newComment: CommentData,
): ChildCommentsData {
  return produce(old, (draft) => {
    draft.pages.at(-1)!.data.push(newComment);
  });
}

/**
 * Updates an existing comment in the root comments cache.
 * Searches through all pages and nested children.
 */
export function updateCommentInRootCache(
  old: RootCommentsData,
  updated: CommentData,
): RootCommentsData {
  return produce(old, (draft) => {
    for (const page of draft.pages) {
      for (const rootComment of page.comments) {
        // Check if it's the root comment itself
        if (rootComment.data.id === updated.id) {
          rootComment.data = updated;
          return;
        }
        // Check if it's in the children
        const childIdx = rootComment.children.data.findIndex(
          (c) => c.id === updated.id,
        );
        if (childIdx !== -1) {
          rootComment.children.data[childIdx] = updated;
          return;
        }
      }
    }
  });
}

/**
 * Updates an existing comment in the child comments cache.
 */
export function updateCommentInChildCache(
  old: ChildCommentsData,
  updated: CommentData,
): ChildCommentsData {
  return produce(old, (draft) => {
    for (const page of draft.pages) {
      const idx = page.data.findIndex((c) => c.id === updated.id);
      if (idx !== -1) {
        page.data[idx] = updated;
        return;
      }
    }
  });
}
