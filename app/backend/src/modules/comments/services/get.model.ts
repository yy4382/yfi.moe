import z from "zod";

export const getCommentsBody = z.object({
  path: z.string(),
  limit: z.number().max(25).min(1),
  offset: z.number(),
  sortBy: z.enum(["created_desc", "created_asc"]),
});

export type GetCommentsBody = z.infer<typeof getCommentsBody>;

export const commentDataUser = z.object({
  id: z.number(),
  content: z.string(),
  parentId: z.number().nullable(),
  replyToId: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userImage: z.string(),
  displayName: z.string(),
  path: z.string(),
});

export type CommentDataUser = z.infer<typeof commentDataUser>;

export const commentDataAdmin = commentDataUser.extend({
  userId: z.string().nullable(),
  userIp: z.string().nullable(),
  userAgent: z.string().nullable(),
  userName: z.string().nullable(),
  userEmail: z.email().nullable(),
  anonymousName: z.string().nullable(),
  visitorName: z.string().nullable(),
  visitorEmail: z.email().nullable(),
});
export type CommentDataAdmin = z.infer<typeof commentDataAdmin>;

export const layeredCommentDataUser = commentDataUser.extend({
  children: z.array(commentDataUser),
});

export const layeredCommentDataAdmin = commentDataAdmin.extend({
  children: z.array(commentDataAdmin),
});

export type LayeredCommentDataUser = z.infer<typeof layeredCommentDataUser>;
export type LayeredCommentDataAdmin = z.infer<typeof layeredCommentDataAdmin>;

export type LayeredComment<T extends CommentDataAdmin | CommentDataUser> = T & {
  children: T[];
};

export const layeredCommentList = z.union([
  z.array(layeredCommentDataAdmin),
  z.array(layeredCommentDataUser),
]);
export type LayeredCommentList = z.infer<typeof layeredCommentList>;

export const getCommentsResponse = z.object({
  comments: layeredCommentList,
});
export type GetCommentsResponse = z.infer<typeof getCommentsResponse>;
