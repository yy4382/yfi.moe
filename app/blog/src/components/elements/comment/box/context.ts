import { createContext } from "react";

export type CommentBoxId = {
  parentId?: number;
  replyingTo?: number;
  editId?: number;
  path: string;
};

export const CommentBoxIdContext = createContext<CommentBoxId>({ path: "" });

export type CommentBoxFillingData = {
  visitorName?: string;
  visitorEmail?: string;
  content: string;
  isAnonymous: boolean;
};
