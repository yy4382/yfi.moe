import { hc } from "hono/client";
import type { AppType } from "@repo/backend";
import { getClientEnv } from "@/env/client";

export function getHonoClient() {
  const { VITE_WALINE_URL } = getClientEnv();
  if (!VITE_WALINE_URL) {
    return null;
  }

  return hc<AppType>(new URL(VITE_WALINE_URL).origin, {
    init: {
      credentials: "include",
    },
  }).api.v1;
}
