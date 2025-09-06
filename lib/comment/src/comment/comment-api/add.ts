import { z } from "zod";
import { commentData } from "@repo/api/comment/comment-data";
import { addComment as addCommentApi } from "@repo/api/comment/add";

// inputting params
export const commentContentSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  },
  z.string().min(1, "内容不能为空").max(500, "内容不能超过 500 字"),
);

export const commentAddParams = z.object({
  path: z.string("客户端未获取到路径，请刷新重试"),
  content: commentContentSchema,

  parentId: z.number().optional(),
  replyToId: z.number().optional(),

  isAnonymous: z.boolean().optional(),
  visitorName: z.string("昵称需要是字符串").optional(),
  visitorEmail: z.email("邮箱应该符合邮箱格式").optional(),
});
export const commentAddParamsBranded =
  commentAddParams.brand("CommentAddParams");

export type CommentAddParams = z.infer<typeof commentAddParams>;
export type CommentAddParamsBranded = z.infer<typeof commentAddParamsBranded>;

// returning params
export const commentAddResponse = z
  .object({ data: commentData, isSpam: z.boolean() })
  .brand("CommentAddResponse");
export type CommentAddResponse = z.infer<typeof commentAddResponse>;

// api fn
// caller needs to pass in the validated (branded) params
// while this fn will return validated response
export async function addComment(
  params: CommentAddParamsBranded,
  serverURL: string,
) {
  const result = await addCommentApi(
    {
      ...params,
      anonymousName: params.isAnonymous ? "匿名" : undefined,
    },
    serverURL,
  );
  if (result._tag === "err") {
    throw new Error(result.error);
  }
  return result.value;
}
