import type { PersistenceOwner } from "@repo/guest-identity/backend";

export type PersistedCommentOwner = {
  userId: string | null;
  guestOwnerKey: string | null;
};

export function isCommentOwnedByViewer(
  comment: PersistedCommentOwner,
  ownedByViewer: readonly PersistenceOwner[],
) {
  if (comment.userId !== null) {
    return ownedByViewer.some(
      (owner) => owner.type === "user" && owner.id === comment.userId,
    );
  }
  return ownedByViewer.some(
    (owner) => owner.type === "guest" && owner.rawKey === comment.guestOwnerKey,
  );
}
