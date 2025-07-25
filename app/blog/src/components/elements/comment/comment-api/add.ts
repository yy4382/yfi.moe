import { z } from "zod";
import { honoClient } from "@/lib/client";
import { commentData } from "@/lib/hono/modules/comments/services/comment-data";

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
export async function addComment(params: CommentAddParamsBranded) {
  const resp = await honoClient.comments.add.$post({
    json: {
      ...params,
      anonymousName: params.isAnonymous ? "匿名" : undefined,
    },
  });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  return commentAddResponse.parse(await resp.json());
}
