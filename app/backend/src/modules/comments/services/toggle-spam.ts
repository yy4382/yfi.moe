import type { User } from "@/auth/auth-plugin.js";
import type { DbClient } from "@/db/db-plugin.js";
import type { AkismetService } from "@/services/akismet.js";
import { comment } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { env } from "@/env.js";
import type { ToggleSpamResponse } from "@repo/api/comment/toggle-spam.model";

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
  },
): Promise<ToggleSpamResult> {
  const { db, user, akismet } = options;

  if (!user) {
    return {
      code: 401,
      data: "Authentication required",
    };
  }

  if (user.role !== "admin") {
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
    return {
      code: 404,
      data: "Comment not found",
    };
  }

  // Update the spam status
  await db
    .update(comment)
    .set({ isSpam })
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
    } else {
      await akismet.submitHam(akismetComment);
    }
  }

  return {
    code: 200,
    data: { success: true },
  };
}
