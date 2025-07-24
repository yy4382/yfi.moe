import { z } from "zod";
import { commentData } from "./comment-data";

export const updateCommentBody = z.object({
  id: z.number(),
  rawContent: z.string(),
});

export const updateCommentResponse = z.object({
  result: z.literal("success"),
  data: commentData,
});

export const updateCommentResponseStatus = {
  200: updateCommentResponse,
  400: z.literal("cannot update deleted comment"),
  403: z.literal("not authorized to update this comment"),
  404: z.literal("comment not found"),
} as const;

export type UpdateCommentResponseStatus = {
  [K in keyof typeof updateCommentResponseStatus]: z.infer<
    (typeof updateCommentResponseStatus)[K]
  >;
};
type ResponseUnion<M extends Record<number, z.ZodType>> = {
  [K in keyof M & number]: {
    code: K;
    data: z.infer<M[K]>;
  };
}[keyof M & number];

// 合并成联合类型
export type OneOfKeyValuePair = ResponseUnion<
  typeof updateCommentResponseStatus
>;

export type UpdateCommentBody = z.infer<typeof updateCommentBody>;
export type UpdateCommentResponse = z.infer<typeof updateCommentResponse>;
