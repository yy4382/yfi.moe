import { z } from "zod";
import { commentReaction } from "@repo/api/comment/comment-data";
import type { CommentReactionReqBody } from "@repo/api/comment/reaction.model";
import { type Result, err, ok } from "@repo/helpers/result";
import type { HonoClient } from "@/lib/api/create-client";

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
  honoClient: HonoClient,
): Promise<Result<CommentReactionResponse, string>> {
  const resp = await honoClient.comments.reaction[":commentId"].add.$post({
    param: { commentId: options.commentId.toString() },
    json: options.body,
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
  honoClient: HonoClient,
): Promise<Result<CommentReactionRemoveResponse, string>> {
  const resp = await honoClient.comments.reaction[":commentId"].remove.$post({
    param: { commentId: options.commentId.toString() },
    json: options.body,
  });
  if (!resp.ok) {
    return err(await resp.text());
  }
  const anonymousKey = resp.headers.get(ANONYMOUS_IDENTITY_HEADER) ?? undefined;
  return ok({ anonymousKey });
}
