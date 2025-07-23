import { z } from "zod";

export const getCommentsBody = z.object({
  path: z.string(),
  limit: z.number().max(25).min(1),
  offset: z.number(),
  sortBy: z.enum(["created_desc", "created_asc"]),
});

export type GetCommentsBody = z.infer<typeof getCommentsBody>;

export const commentData = z.object({
  id: z.number(),
  content: z.string(),
  rawContent: z.string(),
  parentId: z.number().nullable(),
  replyToId: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userImage: z.string(),
  displayName: z.string(),
  path: z.string(),
  userId: z.string().nullish(),
  userIp: z.string().nullish(),
  userAgent: z.string().nullish(),
  userName: z.string().nullish(),
  userEmail: z.email().nullish(),
  anonymousName: z.string().nullish(),
  visitorName: z.string().nullish(),
  visitorEmail: z.email().nullish(),
});

export type CommentData = z.infer<typeof commentData>;

export const layeredCommentData = commentData.extend({
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
