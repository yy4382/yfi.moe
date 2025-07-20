import { hc } from "hono/client";
import type { App } from ".";

export function createClient(...params: Parameters<typeof hc>) {
  return hc<App>(...params).api.v1;
}
export type { App as BackendAppType };
export * from "hono/client";
