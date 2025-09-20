import { type Result, err, ok } from "@repo/helpers/result";
import type { CommentReactionReqBody } from "./reaction.model.js";
import { z } from "zod";
import { commentReaction } from "./comment-data.js";

const ANONYMOUS_IDENTITY_HEADER = "x-anonymous-key";

export type CommentReactionResponse = {
  reaction: z.infer<typeof commentReaction>;
  anonymousKey?: string | undefined;
};

export type CommentReactionRemoveResponse = {
  anonymousKey?: string | undefined;
};

export async function addCommentReaction(
  options: { commentId: number; body: CommentReactionReqBody },
  serverUrl: string,
): Promise<Result<CommentReactionResponse, string>> {
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
  const anonymousKey = resp.headers.get(ANONYMOUS_IDENTITY_HEADER) ?? undefined;
  const parsed = commentReaction.safeParse(await resp.json());
  if (!parsed.success) {
    return err("Invalid response from server");
  }
  return ok({ reaction: parsed.data, anonymousKey });
}

export async function removeCommentReaction(
  options: { commentId: number; body: CommentReactionReqBody },
  serverUrl: string,
): Promise<Result<CommentReactionRemoveResponse, string>> {
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
  const anonymousKey = resp.headers.get(ANONYMOUS_IDENTITY_HEADER) ?? undefined;
  return ok({ anonymousKey });
}
