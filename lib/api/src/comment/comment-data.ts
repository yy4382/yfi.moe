import { z } from "zod";

export const commentReaction = z.object({
  id: z.number(),
  emojiKey: z.string(),
  emojiRaw: z.string(),
  user: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("user"),
      id: z.string(),
      name: z.string(),
      image: z.string(),
    }),
    z.object({ type: z.literal("anonymous"), key: z.string() }),
  ]),
});

export const commentDataUser = z.strictObject({
  displayName: z.string(),
  anonymousName: z.string().nullish(),
  userImage: z.string(),
  // if user is anonymous (anonymousName is not null), userId is null for non-admin
  // while being real for admin
  userId: z.string().nullish(),
});
export const commentDataUserAdmin = z.strictObject({
  ...commentDataUser.shape,
  userIp: z.string().nullish(),
  userAgent: z.string().nullish(),

  // get these three if user is logged in
  userName: z.string().nullish(),
  userEmail: z.string().nullish(),

  // get these two if user is not logged in
  visitorName: z.string().nullish(),
  visitorEmail: z.email().nullish(),

  isSpam: z.boolean().nullish(),
});

export const commentDataBase = z.strictObject({
  id: z.number(),
  content: z.string(),
  rawContent: z.string(),
  parentId: z.number().nullable(),
  replyToId: z.number().nullable(),
  reactions: z.array(commentReaction),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  path: z.string(),
});

export const commentDataNonAdmin = z.object({
  ...commentDataBase.shape,
  ...commentDataUser.shape,
});

export const commentData = z
  .object({
    ...commentDataBase.shape,
    ...commentDataUserAdmin.shape,
  })
  .meta({ ref: "CommentData", description: "Comment data structure" });

export type CommentData = z.infer<typeof commentData>;
