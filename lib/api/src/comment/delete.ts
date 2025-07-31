import { type Result, err, ok } from "@repo/helpers/result";
import {
  type DeleteCommentRequest,
  type DeleteCommentResponse,
  deleteCommentResponse,
} from "./delete.model.js";

export async function deleteComment(
  options: DeleteCommentRequest,
  serverUrl: string,
): Promise<Result<DeleteCommentResponse, string>> {
  const path = new URL("v1/comments/delete", serverUrl).href;
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
  return ok(deleteCommentResponse.parse(await resp.json()));
}
