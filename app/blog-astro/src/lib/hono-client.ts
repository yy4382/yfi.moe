import { WALINE_URL } from "astro:env/client";
import { hc } from "hono/client";
import type { AppType } from "@repo/backend";

export const client = hc<AppType>(new URL(WALINE_URL).origin, {
  init: {
    credentials: "include",
  },
}).api.v1;
