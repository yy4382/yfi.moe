import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    ARTICLE_PAT: z.string(),
    POST_GH_INFO: z.string(),
    PAGE_GH_INFO: z.string(),

    CONTENT_REFRESH_TOKEN: z.string(),

    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.url(),
    NEXT_PUBLIC_BACKEND_URL: z.url(),
    NEXT_PUBLIC_WALINE_URL: z.url(),
  },
  runtimeEnv: {
    ARTICLE_PAT: process.env.ARTICLE_PAT,
    POST_GH_INFO: process.env.POST_GH_INFO,
    PAGE_GH_INFO: process.env.PAGE_GH_INFO,
    CONTENT_REFRESH_TOKEN: process.env.CONTENT_REFRESH_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_WALINE_URL: process.env.NEXT_PUBLIC_WALINE_URL,
  },
});
