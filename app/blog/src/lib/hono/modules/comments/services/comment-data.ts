import { z } from "zod";
import type { InferSelectModel } from "drizzle-orm";
import { comment, user } from "@/lib/db/schema";
import { getGravatarUrl } from "@/lib/utils/get-gravatar-url";
import { User } from "@/lib/auth/auth-plugin";

export const commentDataUser = z.strictObject({
  displayName: z.string(),
  anonymousName: z.string().nullish(),
  userImage: z.string(),
});
export const commentDataUserAdmin = z.strictObject({
  ...commentDataUser.shape,
  userIp: z.string().nullish(),
  userAgent: z.string().nullish(),

  // get these three if user is logged in
  userId: z.string().nullish(),
  userName: z.string().nullish(),
  userEmail: z.string().nullish(),

  // get these two if user is not logged in
  visitorName: z.string().nullish(),
  visitorEmail: z.email().nullish(),
});

export const commentDataBase = z.strictObject({
  id: z.number(),
  content: z.string(),
  rawContent: z.string(),
  parentId: z.number().nullable(),
  replyToId: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  path: z.string(),
});

export const commentDataNonAdmin = z.strictObject({
  ...commentDataBase.shape,
  ...commentDataUser.shape,
});

export const commentData = z.strictObject({
  ...commentDataBase.shape,
  ...commentDataUserAdmin.shape,
});

export type CommentData = z.infer<typeof commentData>;

export function tablesToCommentData(
  commentTableData: InferSelectModel<typeof comment>,
  userTableData: InferSelectModel<typeof user> | User | null,
  isAdmin: boolean,
): CommentData {
  const baseData: z.input<typeof commentDataBase> = {
    id: commentTableData.id,
    content: commentTableData.renderedContent,
    rawContent: commentTableData.rawContent,
    path: commentTableData.path,
    parentId: commentTableData.parentId,
    replyToId: commentTableData.replyToId,
    createdAt: commentTableData.createdAt,
    updatedAt: commentTableData.updatedAt,
  };
  const userBase: z.input<typeof commentDataUser> = {
    anonymousName: commentTableData.anonymousName,
    displayName:
      (commentTableData.anonymousName ||
        commentTableData.visitorName ||
        userTableData?.name) ??
      "Unknown",
    userImage: commentTableData.anonymousName
      ? "https://avatar.vercel.sh/anonymous"
      : (userTableData?.image ??
        getGravatarUrl(
          userTableData?.email ?? commentTableData.visitorEmail ?? "",
        )),
  };
  const adminData: z.input<typeof commentDataUserAdmin> = {
    ...userBase,
    userIp: commentTableData.userIp,
    userAgent: commentTableData.userAgent,
    userId: userTableData?.id,
    userName: userTableData?.name,
    userEmail: userTableData?.email,
    visitorName: commentTableData.visitorName,
    visitorEmail: commentTableData.visitorEmail,
  };
  const fullData = {
    ...baseData,
    ...adminData,
  };
  if (isAdmin) {
    return commentData.parse(fullData);
  } else {
    return commentDataNonAdmin.parse(fullData);
  }
}
