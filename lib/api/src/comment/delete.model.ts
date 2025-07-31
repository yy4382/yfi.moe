import { z } from "zod";

export const deleteCommentRequest = z.object({
  id: z.number(),
});
export type DeleteCommentRequest = z.infer<typeof deleteCommentRequest>;

export const deleteCommentResponse = z.object({
  deletedIds: z.array(z.number()),
});
export type DeleteCommentResponse = z.infer<typeof deleteCommentResponse>;
