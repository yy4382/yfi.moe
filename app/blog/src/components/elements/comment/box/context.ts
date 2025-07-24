import { createContext } from "react";

export type CommentBoxId = {
  parentId?: number;
  replyingTo?: number;
  editId?: number;
  path: string;
};

export const CommentBoxIdContext = createContext<CommentBoxId>({ path: "" });

type CommentBoxStatus = {
  status: "pending" | "success" | "error" | "idle";
  placeholder?: string;
  reset: () => void;
  cancel?: () => void;
};
export const CommentBoxStatusContext = createContext<CommentBoxStatus>({
  status: "idle",
  reset: () => {},
});

export type CommentBoxFillingData = {
  visitorName?: string;
  visitorEmail?: string;
  content: string;
};

export type WithSuccess<T> = T extends (arg1: infer K) => void
  ? (arg1: K, opt: { onSuccess: () => void }) => void
  : never;
