import { z } from "zod";

export const unsubscribeReq = z.object({
  email: z.email(),
  credentials: z
    .object({
      signature: z.string(),
      expiresAtTimestampSec: z.number().int().positive(),
    })
    .optional(),
});

export type UnsubscribeReq = z.infer<typeof unsubscribeReq>;
