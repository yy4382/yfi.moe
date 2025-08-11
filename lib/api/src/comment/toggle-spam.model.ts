import { z } from "zod";

export const toggleSpamRequest = z.object({
  id: z.number(),
  isSpam: z.boolean(),
});
export type ToggleSpamRequest = z.infer<typeof toggleSpamRequest>;

export const toggleSpamResponse = z.object({
  success: z.boolean(),
});
export type ToggleSpamResponse = z.infer<typeof toggleSpamResponse>;
