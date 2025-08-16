import { createContext } from "react";

export type CommentBoxId = {
  parentId?: number | undefined;
  replyingTo?: number | undefined;
  editId?: number | undefined;
  path: string;
};

export const CommentBoxIdContext = createContext<CommentBoxId>({ path: "" });

export type CommentBoxFillingData = {
  visitorName?: string;
  visitorEmail?: string;
  content: string;
  isAnonymous: boolean;
};
