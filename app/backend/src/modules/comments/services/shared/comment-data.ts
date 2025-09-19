import { z } from "zod";
import type { InferSelectModel } from "drizzle-orm";
import { comment, user } from "@/db/schema.js";
import { getGravatarUrl } from "@repo/helpers/get-gravatar-url";
import type { User } from "@/auth/auth-plugin.js";
import {
  commentDataBase,
  commentDataUser,
  commentDataUserAdmin,
  commentData,
  commentDataNonAdmin,
  type CommentData,
} from "@repo/api/comment/comment-data";

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
    createdAt: commentTableData.createdAt.toISOString(),
    updatedAt: commentTableData.updatedAt.toISOString(),
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
    userId: commentTableData.anonymousName
      ? isAdmin
        ? userTableData?.id
        : null
      : userTableData?.id,
  };
  const adminData: z.input<typeof commentDataUserAdmin> = {
    ...userBase,
    userIp: commentTableData.userIp,
    userAgent: commentTableData.userAgent,
    userName: userTableData?.name,
    userEmail: userTableData?.email,
    visitorName: commentTableData.visitorName,
    visitorEmail: commentTableData.visitorEmail,
    isSpam: commentTableData.isSpam,
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
