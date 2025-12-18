import { describeRoute, resolver, validator } from "hono-openapi";
import {
  getCommentsBody,
  getCommentsChildrenBody,
  getCommentsChildrenResponse,
  getCommentsResponse,
} from "@repo/api/comment/get.model";
import { factory } from "@/factory.js";
import { getComments, getCommentsChildren } from "../services/get.js";

export const getCommentsRoute = factory
  .createApp()
  .post(
    "/get",
    describeRoute({
      description: "Get comment list",
      tags: ["Comments"],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(getCommentsResponse),
            },
          },
        },
      },
    }),
    validator("json", getCommentsBody),
    async (c) => {
      const body = c.req.valid("json");
      c.get("logger").debug(
        {
          path: body.path,
          sortBy: body.sortBy,
          limit: body.limit,
          cursor: body.cursor,
          userId: c.get("auth")?.user?.id,
        },
        "comments:get request",
      );
      const result = await getComments(body, {
        db: c.get("db"),
        user: c.get("auth")?.user ?? null,
        logger: c.get("logger"),
      });
      const resp = getCommentsResponse.parse(result);
      c.get("logger").debug(
        { total: result.total, returned: result.comments.length },
        "comments:get response",
      );
      return c.json(resp, 200);
    },
  )
  .post(
    "/get-children",
    describeRoute({
      description: "Get child comments of a root comment",
      tags: ["Comments"],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(getCommentsResponse),
            },
          },
        },
      },
    }),
    validator("json", getCommentsChildrenBody),
    async (c) => {
      const body = c.req.valid("json");
      c.get("logger").debug(body, "comments:get-children request");
      const result = await getCommentsChildren(body, {
        db: c.get("db"),
        user: c.get("auth")?.user ?? null,
        logger: c.get("logger"),
      });
      const resp = getCommentsChildrenResponse.parse(result);
      return c.json(resp, 200);
    },
  );
