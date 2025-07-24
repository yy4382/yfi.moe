import { z } from "zod";
import { commentContentSchema } from "./add";
import { honoClient } from "@/lib/client";
import { commentData } from "@/lib/hono/modules/comments/services/comment-data";

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
): Promise<CommentUpdateResponse> {
  const resp = await honoClient.comments.update.$post({
    json: {
      id: params.id,
      rawContent: params.content,
    },
  });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  return commentUpdateResponse.parse(await resp.json());
}
