import z from "zod/v4";
export const commentDataUserSchema = z.object({
  id: z.number(),
  content: z.string(),
  parentId: z.number().nullable(),
  replyToId: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userImage: z.string(),
  displayName: z.string(),
  isMine: z.boolean(),
  path: z.string(),
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

export const commentPostBodySchema = z.object({
  path: z.string(),
  content: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return value.trim();
      }
      return value;
    },
    z.string().min(1, "内容不能为空").max(500, "内容不能超过 500 字"),
  ),
  parentId: z.number().optional(),
  replyToId: z.number().optional(),
  anonymousName: z.string().optional(),
  visitorName: z.string().optional(),
  visitorEmail: z.email("邮箱不合法").optional(),
});
