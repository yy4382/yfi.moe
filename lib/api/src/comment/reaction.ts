import { type Result, err, ok } from "@repo/helpers/result";
import type { CommentReactionReqBody } from "./reaction.model.js";
import { z } from "zod";
import { commentReaction } from "./comment-data.js";

export async function addCommentReaction(
  options: { commentId: number; body: CommentReactionReqBody },
  serverUrl: string,
): Promise<Result<z.infer<typeof commentReaction>, string>> {
  const path = new URL(
    `v1/comments/reaction/${options.commentId}/add`,
    serverUrl,
  ).href;
  const resp = await fetch(path, {
    method: "POST",
    body: JSON.stringify(options.body),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!resp.ok) {
    return err(await resp.text());
  }
  const parsed = commentReaction.safeParse(await resp.json());
  if (!parsed.success) {
    return err("Invalid response from server");
  }
  return ok(parsed.data);
}

export async function removeCommentReaction(
  options: { commentId: number; body: CommentReactionReqBody },
  serverUrl: string,
): Promise<Result<undefined, string>> {
  const path = new URL(
    `v1/comments/reaction/${options.commentId}/remove`,
    serverUrl,
  ).href;
  const resp = await fetch(path, {
    method: "POST",
    body: JSON.stringify(options.body),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!resp.ok) {
    return err(await resp.text());
  }
  return ok(undefined);
}
