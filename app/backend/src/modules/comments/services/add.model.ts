import { z } from "zod";

export const addCommentBody = z.object({
  path: z.string(),
  content: z.string().min(1).max(500),
  parentId: z.number().optional(),
  replyToId: z.number().optional(),
  anonymousName: z.string().min(1).max(100).optional(),
  visitorName: z.string().min(1).max(100).optional(),
  visitorEmail: z.string().email().optional(),
});
export type AddCommentBody = z.infer<typeof addCommentBody>;

export const addCommentResponse = z.object({
  id: z.number(),
});
export type AddCommentResponse = z.infer<typeof addCommentResponse>;
