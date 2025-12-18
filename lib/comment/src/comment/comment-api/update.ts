import { z } from "zod";
import { commentData } from "@repo/api/comment/comment-data";
import type { HonoClient } from "../context";
import { commentContentSchema } from "./add";

// inputting params
export const commentUpdateParams = z.object({
  id: z.number(),
  content: commentContentSchema,
});
export const commentUpdateParamsBranded = commentUpdateParams.brand(
  "commentUpdateParamsBranded",
);

export type CommentUpdateParams = z.infer<typeof commentUpdateParams>;
export type CommentUpdateParamsBranded = z.infer<
  typeof commentUpdateParamsBranded
>;

// response
export const commentUpdateResponse = z
  .object({
    data: commentData,
  })
  .brand("commentUpdateResponse");
export type CommentUpdateResponse = z.infer<typeof commentUpdateResponse>;

export async function updateComment(
  params: CommentUpdateParamsBranded,
  honoClient: HonoClient,
): Promise<CommentUpdateResponse> {
  const result = await honoClient.comments.update.$post({
    json: {
      id: params.id,
      rawContent: params.content,
    },
  });
  if (!result.ok) {
    throw new Error(await result.text());
  }
  return commentUpdateResponse.decode(await result.json());
}
