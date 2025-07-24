import { z } from "zod";
import { commentData } from "./comment-data";

export const getCommentsBody = z.object({
  path: z.string(),
  limit: z.number().max(25).min(1),
  offset: z.number(),
  sortBy: z.enum(["created_desc", "created_asc"]),
});

export type GetCommentsBody = z.infer<typeof getCommentsBody>;

export const layeredCommentData = z.object({
  ...commentData.shape,
  children: z.array(commentData),
});

export type LayeredCommentData = z.infer<typeof layeredCommentData>;

export const layeredCommentList = z.array(layeredCommentData);
export type LayeredCommentList = z.infer<typeof layeredCommentList>;

export const getCommentsResponse = z.object({
  total: z.number(),
  comments: layeredCommentList,
});
export type GetCommentsResponse = z.infer<typeof getCommentsResponse>;
