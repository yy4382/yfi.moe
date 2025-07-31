import { z } from "zod";
import { commentContentSchema } from "./add";
import { commentData } from "@repo/api/comment/comment-data";
import { updateComment as updateCommentApi } from "@repo/api/comment/update";
import { env } from "@/env";

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
  const result = await updateCommentApi(
    {
      id: params.id,
      rawContent: params.content,
    },
    env.NEXT_PUBLIC_BACKEND_URL,
  );
  if (result._tag === "err") {
    throw new Error(result.error);
  }
  return commentUpdateResponse.parse(result.value);
}
