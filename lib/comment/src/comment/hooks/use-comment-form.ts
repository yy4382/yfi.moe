import { atom, type PrimitiveAtom } from "jotai";
import { useState } from "react";

export interface CommentFormAtoms {
  /** Atom holding the comment content */
  contentAtom: PrimitiveAtom<string>;
  /** Atom for anonymous posting toggle */
  isAnonymousAtom: PrimitiveAtom<boolean>;
}

/**
 * Creates isolated Jotai atoms for a comment form instance.
 *
 * Each form (new comment, reply, edit) gets its own atoms,
 * preventing state conflicts between multiple open forms.
 *
 * @param initialContent - Optional initial content for editing
 */
export function useCommentFormAtoms(initialContent = ""): CommentFormAtoms {
  const [contentAtom] = useState<PrimitiveAtom<string>>(() =>
    atom(initialContent),
  );
  const [isAnonymousAtom] = useState<PrimitiveAtom<boolean>>(() => atom(false));

  return { contentAtom, isAnonymousAtom };
}
