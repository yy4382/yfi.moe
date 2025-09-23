import { z } from "zod";
import { commentData } from "./comment-data.js";

export const getCommentsBody = z.object({
  path: z.string(),
  limit: z.number().max(25).min(1),
  cursor: z.number().optional(),
  sortBy: z.enum(["created_desc", "created_asc"]),
});

export type GetCommentsBody = z.infer<typeof getCommentsBody>;

export const layeredCommentData = z.object({
  data: commentData,
  children: z.object({
    data: z.array(commentData),
    hasMore: z.boolean(),
    cursor: z.number(),
    total: z.number(),
  }),
});

export type LayeredCommentData = z.infer<typeof layeredCommentData>;

export const layeredCommentList = z.array(layeredCommentData);
export type LayeredCommentList = z.infer<typeof layeredCommentList>;

export const getCommentsResponse = z.object({
  total: z.number(),
  cursor: z.number(),
  hasMore: z.boolean(),
  comments: z.array(layeredCommentData),
});
export type GetCommentsResponse = z.infer<typeof getCommentsResponse>;

export const getCommentsChildrenBody = z.object({
  ...getCommentsBody.shape,
  rootId: z.number(),
});
export type GetCommentsChildrenBody = z.infer<typeof getCommentsChildrenBody>;

export const getCommentsChildrenResponse = z.object({
  cursor: z.number(),
  hasMore: z.boolean(),
  data: z.array(commentData),
});

export type GetCommentsChildrenResponse = z.infer<
  typeof getCommentsChildrenResponse
>;
