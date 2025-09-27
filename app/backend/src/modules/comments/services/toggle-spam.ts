import { eq } from "drizzle-orm";
import type { ToggleSpamResponse } from "@repo/api/comment/toggle-spam.model";
import type { User } from "@/auth/auth-plugin.js";
import type { DbClient } from "@/db/db-plugin.js";
import { comment } from "@/db/schema.js";
import { env } from "@/env.js";
import type { AkismetService } from "@/services/akismet.js";

type ToggleSpamResult =
  | {
      code: 200;
      data: ToggleSpamResponse;
    }
  | {
      code: 401 | 403 | 404;
      data: string;
    };

export async function toggleCommentSpam(
  commentId: number,
  isSpam: boolean,
  options: {
    db: DbClient;
    user: User | null;
    akismet: AkismetService | null;
    logger?: import("pino").Logger;
  },
): Promise<ToggleSpamResult> {
  const { db, user, akismet, logger } = options;
  logger?.debug({ commentId, isSpam, userId: user?.id }, "toggleSpam:start");

  if (!user) {
    logger?.warn({ commentId }, "toggleSpam:unauthenticated");
    return {
      code: 401,
      data: "Authentication required",
    };
  }

  if (user.role !== "admin") {
    logger?.warn({ commentId, userId: user.id }, "toggleSpam:not admin");
    return {
      code: 403,
      data: "Only admins can toggle spam status",
    };
  }

  // Find the comment
  const comments = await db
    .select()
    .from(comment)
    .where(eq(comment.id, commentId))
    .limit(1);

  const targetComment = comments[0];
  if (!targetComment) {
    logger?.warn({ commentId }, "toggleSpam:not found");
    return {
      code: 404,
      data: "Comment not found",
    };
  }
  if (targetComment.deletedAt !== null) {
    logger?.warn({ commentId }, "toggleSpam:deleted comment");
    return {
      code: 404,
      data: "Comment not found",
    };
  }
  if (targetComment.isSpam === isSpam) {
    logger?.info({ commentId, isSpam }, "toggleSpam:no change needed");
    return {
      code: 200,
      data: { success: true },
    };
  }

  // Update the spam status
  await db
    .update(comment)
    .set({ isSpam, updatedAt: new Date() })
    .where(eq(comment.id, commentId))
    .returning();

  // Submit feedback to Akismet if available
  if (akismet && targetComment.userIp && targetComment.userAgent) {
    const permalink = new URL(targetComment.path, env.FRONTEND_URL).toString();
    const akismetComment = {
      content: targetComment.rawContent,
      userIp: targetComment.userIp,
      userAgent: targetComment.userAgent,
      author: targetComment.visitorName || undefined,
      authorEmail: targetComment.visitorEmail || undefined,
      permalink,
    };

    if (isSpam) {
      await akismet.submitSpam(akismetComment);
      logger?.info({ commentId }, "toggleSpam:submit spam to akismet");
    } else {
      await akismet.submitHam(akismetComment);
      logger?.info({ commentId }, "toggleSpam:submit ham to akismet");
    }
  }

  logger?.info({ commentId, isSpam }, "toggleSpam:success");
  return {
    code: 200,
    data: { success: true },
  };
}
