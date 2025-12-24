import { hc } from "hono/client";
import type { AppType } from "@repo/backend";

export function createHonoClient(serverURL: string) {
  return hc<AppType>(new URL(serverURL).origin, {
    init: {
      credentials: "include",
    },
  }).api.v1;
}

export type HonoClient = ReturnType<typeof createHonoClient>;
