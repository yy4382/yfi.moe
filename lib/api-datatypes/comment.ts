import z from "zod/v4";
export const commentDataUserSchema = z.object({
  id: z.number(),
  content: z.string(),
  parentId: z.number().nullable(),
  replyToId: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userImage: z.string().nullable(),
  displayName: z.string(),
  isMine: z.boolean(),
});
export type CommentDataUser = z.infer<typeof commentDataUserSchema>;

export const commentDataAdminSchema = commentDataUserSchema.extend({
  userId: z.string().nullable(),
  userIp: z.string().nullable(),
  userAgent: z.string().nullable(),
  userName: z.string().nullable(),
  userEmail: z.string().nullable(),
  anonymousName: z.string().nullable(),
  visitorName: z.string().nullable(),
  visitorEmail: z.string().nullable(),
});

export type CommentDataAdmin = z.infer<typeof commentDataAdminSchema>;
