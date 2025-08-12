import type { User } from "@/auth/auth-plugin.js";
import {
  type AddCommentBody,
  addCommentResponse,
  type AddCommentResponse,
} from "@repo/api/comment/add.model";
import { comment } from "@/db/schema.js";
import { parseMarkdown } from "../shared/parse-markdown.js";
import type { DbClient } from "@/db/db-plugin.js";
import type { AkismetService } from "@/services/akismet.js";
import { env } from "@/env.js";
import z from "zod";
import { tablesToCommentData } from "../shared/comment-data.js";
import type { InferSelectModel } from "drizzle-orm";
import { type Result, ok, err } from "@repo/helpers/result";
import type { NotificationService } from "@/notification/types.js";
import { sendNotification } from "./notify.js";

type AddCommentResult =
  | {
      result: "success";
      data: AddCommentResponse;
    }
  | {
      result: "bad_req";
      data: { message: string };
    };

export async function addComment(
  body: AddCommentBody,
  options: {
    db: DbClient;
    user: User | null;
    ip?: string;
    ua?: string;
    akismet?: AkismetService | null;
    notificationService: NotificationService;
  },
): Promise<AddCommentResult> {
  const { db, akismet, user: currentUser } = options;
  if (!currentUser && (!body.visitorName || !body.visitorEmail)) {
    return {
      result: "bad_req",
      data: { message: "昵称和邮箱不能为空" },
    };
  }

  const renderedContent = await parseMarkdown(body.content);

  const isSpam = await checkSpam(body, akismet, options);

  const newCommentResult = await insertToDb(db, {
    body,
    renderedContent,
    isSpam,
    ...options,
  });
  if (newCommentResult._tag === "err") {
    return {
      result: "bad_req",
      data: { message: "failed to add comment" },
    };
  }
  const newComment = newCommentResult.value;

  const data = tablesToCommentData(
    newComment,
    currentUser,
    currentUser?.role === "admin",
  );
  sendNotification(
    {
      id: newComment.id,
      userId: newComment.userId ?? undefined,
      path: body.path,
      name: data.displayName,
      email: data.visitorEmail ?? data.userEmail ?? undefined,
      rawContent: newComment.rawContent,
      renderedContent: newComment.renderedContent,
      isSpam: newComment.isSpam,
      replyToId: newComment.replyToId ?? undefined,
    },
    db,
    options.notificationService,
  );
  return {
    result: "success",
    data: {
      data,
      isSpam: newComment.isSpam,
    } satisfies z.input<typeof addCommentResponse>,
  };
}

async function insertToDb(
  db: DbClient,
  data: {
    body: AddCommentBody;
    renderedContent: string;
    isSpam: boolean;
    user: User | null;
    ip?: string;
    ua?: string;
  },
): Promise<Result<InferSelectModel<typeof comment>, null>> {
  const { body, user: currentUser } = data;
  try {
    const inserted = await db
      .insert(comment)
      .values({
        path: body.path,
        rawContent: body.content,
        renderedContent: data.renderedContent,
        parentId: body.parentId,
        replyToId: body.replyToId,
        anonymousName: body.anonymousName,
        visitorEmail: currentUser ? undefined : body.visitorEmail,
        visitorName: currentUser
          ? undefined
          : (body.visitorName ?? "Anonymous"),
        isSpam: data.isSpam,
        userId: currentUser?.id,
        userIp: data.ip,
        userAgent: data.ua,
      })
      .returning();

    const newComment = inserted[0];
    if (!newComment) {
      console.error("failed to insert comment: returning empty");
      return err(null);
    }
    return ok(newComment);
  } catch (error) {
    console.error(error);
    return err(null);
  }
}

async function checkSpam(
  body: AddCommentBody,
  akismet: AkismetService | null | undefined,
  meta: {
    user: User | null;
    ip?: string;
    ua?: string;
  },
) {
  let isSpam = false;
  if (akismet) {
    const permalink = new URL(body.path, env.FRONTEND_URL).toString();
    isSpam = await akismet.checkSpam({
      content: body.content,
      userIp: meta.ip ?? "",
      userAgent: meta.ua,
      author: meta.user?.name || body.visitorName || body.anonymousName,
      authorEmail: meta.user?.email || body.visitorEmail,
      permalink,
    });
  }
  return isSpam;
}
