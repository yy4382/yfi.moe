import { loadEnv } from "vite";
import { z } from "zod";

const envSchema = z.object({
  // Path to local git repo containing posts
  POSTS_REPO_PATH: z.string(),
  // Subdirectory within repo where posts are stored
  POSTS_SUBDIR: z.string().default("post"),
  // Simple auth token for API protection
  AUTH_TOKEN: z.string(),
});

const envUnparsed = loadEnv("server", process.cwd(), "");
export const env = envSchema.parse(envUnparsed);
export type Env = z.infer<typeof envSchema>;
