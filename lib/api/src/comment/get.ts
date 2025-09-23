import { type Result, err, ok } from "@repo/helpers/result";
import {
  type GetCommentsBody,
  type GetCommentsChildrenBody,
  getCommentsChildrenResponse,
  type GetCommentsChildrenResponse,
  type GetCommentsResponse,
  getCommentsResponse,
} from "./get.model.js";

export async function getComments(
  options: GetCommentsBody,
  serverUrl: string,
): Promise<Result<GetCommentsResponse, string>> {
  const path = new URL("v1/comments/get", serverUrl).href;
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
  return ok(getCommentsResponse.parse(await resp.json()));
}

export async function getCommentsChildren(
  options: GetCommentsChildrenBody,
  serverUrl: string,
): Promise<Result<GetCommentsChildrenResponse, string>> {
  const path = new URL("v1/comments/get-children", serverUrl).href;
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
  return ok(getCommentsChildrenResponse.parse(await resp.json()));
}
