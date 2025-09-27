import { type Result, err, ok } from "@repo/helpers/result";
import {
  addCommentResponse,
  type AddCommentBody,
  type AddCommentResponse,
} from "./add.model.js";

export async function addComment(
  options: AddCommentBody,
  serverUrl: string,
): Promise<Result<AddCommentResponse, string>> {
  const path = new URL("v1/comments/add", serverUrl).href;
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
  return ok(addCommentResponse.parse(await resp.json()));
}
