import { z } from "zod";
import { commentReaction } from "@repo/api/comment/comment-data";
import type { CommentReactionReqBody } from "@repo/api/comment/reaction.model";
import { type Result, err, ok } from "@repo/helpers/result";
import type { HonoClient } from "@/lib/api/create-client";

export type CommentReactionResponse = {
  reaction: z.infer<typeof commentReaction>;
  identityHeaders: Headers;
};

export type CommentReactionRemoveResponse = {
  identityHeaders: Headers;
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
  const parsed = commentReaction.safeParse(await resp.json());
  if (!parsed.success) {
    return err("Invalid response from server");
  }
  return ok({ reaction: parsed.data, identityHeaders: resp.headers });
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
  return ok({ identityHeaders: resp.headers });
}
