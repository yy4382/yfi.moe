import { z } from "zod";

const serverEnvSchema = z.object({
  ARTICLE_PAT: z.string().min(1),
  POST_GH_INFO: z.string().min(1),
  PAGE_GH_INFO: z.string().min(1),
  IMAGE_META_SOURCE: z.string().min(1),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}
