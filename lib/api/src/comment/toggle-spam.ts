import { type Result, err, ok } from "@repo/helpers/result";
import {
  toggleSpamResponse,
  type ToggleSpamRequest,
  type ToggleSpamResponse,
} from "./toggle-spam.model.js";

export async function toggleCommentSpam(
  options: ToggleSpamRequest,
  serverUrl: string,
): Promise<Result<ToggleSpamResponse, string>> {
  const path = new URL("v1/comments/toggle-spam", serverUrl).href;
  const resp = await fetch(path, {
    method: "POST",
    body: JSON.stringify(options),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!resp.ok) {
    return err(await resp.text());
  }
  return ok(toggleSpamResponse.parse(await resp.json()));
}
