import { betterAuthPlugin } from "../../auth/auth-plugin";
import {
  addCommentResponse,
  addCommentBody,
  getCommentsBody,
  getCommentsResponse,
} from "./model";
import { getComments } from "./services/get";
import { Elysia, t } from "elysia";
import { db } from "../../db/instance";
import { addComment, AddCommentError } from "./services/add";
import { deleteComment } from "./services/delete";

export const comments = new Elysia({ prefix: "/comments" })
  .use(betterAuthPlugin)
  .post(
    "/get",
    async ({ user, body }) => {
      return {
        comments: await getComments(body, { db, user }),
      };
    },
    { auth: true, body: getCommentsBody, response: getCommentsResponse },
  )
  .error({ AddCommentError })
  .post(
    "/add",
    async ({ user, body, headers }) => {
      return await addComment(body, {
        db,
        user,
        ip: headers["x-forwarded-for"],
        ua: headers["user-agent"],
      });
    },
    {
      auth: true,
      body: addCommentBody,
      response: addCommentResponse,
      error({ error }) {
        return error;
      },
    },
  )
  .delete(
    "/delete",
    async ({ user, body, status }) => {
      if (!user) {
        return status(401, { result: "unauthorized" });
      }
      const res = await deleteComment(body.id, { db, user });
      if (res.result === "error") {
        return status(404, {
          result: "comment not found or not allowed to delete",
        });
      }
      return status(200, { result: "success" });
    },
    {
      auth: true,
      body: t.Object({ id: t.Number() }),
      response: {
        200: t.Object({ result: t.Literal("success") }),
        401: t.Object({ result: t.Literal("unauthorized") }),
        404: t.Object({
          result: t.Literal("comment not found or not allowed to delete"),
        }),
      },
    },
  );
