import { type Result, err, ok } from "@repo/helpers/result";
import {
  type UpdateCommentBody,
  type UpdateCommentResponse,
  updateCommentResponse,
} from "./update.model.js";

export async function updateComment(
  options: UpdateCommentBody,
  serverUrl: string,
): Promise<Result<UpdateCommentResponse, string>> {
  const path = new URL("v1/comments/update", serverUrl).href;
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
  return ok(updateCommentResponse.parse(await resp.json()));
}
