import { hc } from "hono/client";
import type { AppType } from "@repo/backend";
import { getClientEnv } from "@/env/client";

export const client = hc<AppType>(
  new URL(getClientEnv().VITE_WALINE_URL).origin,
  {
    init: {
      credentials: "include",
    },
  },
).api.v1;
