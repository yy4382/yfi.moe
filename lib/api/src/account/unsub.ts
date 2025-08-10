import type { UnsubscribeReq } from "./unsub.model.js";
import { ok, err, type Result } from "@repo/helpers/result";

export async function unsubscribe(
  options: UnsubscribeReq,
  serverUrl: string,
): Promise<Result<void, string>> {
  const path = new URL("v1/account/notification/unsubscribe", serverUrl).href;
  const resp = await fetch(path, {
    method: "POST",
    body: JSON.stringify(options),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await resp.json();
  if (!data.success) {
    return err(data.cause as string);
  }
  return ok(undefined);
}

export async function resubscribe(
  options: UnsubscribeReq,
  serverUrl: string,
): Promise<Result<void, string>> {
  const path = new URL("v1/account/notification/resubscribe", serverUrl).href;
  const resp = await fetch(path, {
    method: "POST",
    body: JSON.stringify(options),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await resp.json();
  if (!data.success) {
    return err(data.cause as string);
  }
  return ok(undefined);
}
