import { z } from "zod";
import type { InferSelectModel } from "drizzle-orm";
import { comment, reaction, user } from "@/db/schema.js";
import { getDiceBearUrl } from "@repo/helpers/get-gravatar-url";
import type { User } from "@/auth/auth-plugin.js";
import {
  commentDataBase,
  commentDataUser,
  commentDataUserAdmin,
  commentData,
  commentDataNonAdmin,
  type CommentData,
  commentReaction,
} from "@repo/api/comment/comment-data";
import SparkMD5 from "spark-md5";

export function tablesToCommentData(
  commentTableData: InferSelectModel<typeof comment>,
  userTableData: InferSelectModel<typeof user> | User | null,
  reactionTableData: {
    reaction: InferSelectModel<typeof reaction>;
    user: InferSelectModel<typeof user> | null;
  }[],
  isAdmin: boolean,
): CommentData {
  const reactions: z.infer<typeof commentReaction>[] = reactionTableData.map(
    (r) => {
      const user: z.infer<typeof commentReaction.shape.user> = r.user
        ? {
            type: "user",
            id: r.user.id,
            name: r.user.name,
            image: r.user.image ?? getDiceBearUrl(r.user.id),
          }
        : { type: "anonymous", key: SparkMD5.hash(r.reaction.actorAnonKey!) };
      return {
        id: r.reaction.id,
        emojiKey: r.reaction.emojiKey,
        emojiRaw: r.reaction.emojiRaw,
        user: user,
      };
    },
  );

  const baseData: z.input<typeof commentDataBase> = {
    id: commentTableData.id,
    content: commentTableData.renderedContent,
    rawContent: commentTableData.rawContent,
    path: commentTableData.path,
    parentId: commentTableData.parentId,
    replyToId: commentTableData.replyToId,
    reactions,
    createdAt: commentTableData.createdAt.toISOString(),
    updatedAt: commentTableData.updatedAt.toISOString(),
  };

  function getAvatar() {
    if (commentTableData.anonymousName) {
      return "https://avatar.vercel.sh/anonymous";
    }
    if (userTableData?.image) {
      return userTableData.image;
    }
    if (userTableData) {
      return getDiceBearUrl(userTableData.id);
    }
    return getDiceBearUrl(commentTableData.visitorEmail ?? "", {
      hashBeforeUse: true,
    });
  }
  const userBase: z.input<typeof commentDataUser> = {
    anonymousName: commentTableData.anonymousName,
    displayName:
      (commentTableData.anonymousName ||
        commentTableData.visitorName ||
        userTableData?.name) ??
      "Unknown",
    userImage: getAvatar(),
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
