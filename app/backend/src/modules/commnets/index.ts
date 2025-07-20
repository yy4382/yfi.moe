import { betterAuthPlugin } from "../../auth/auth-plugin";
import { getCommentsBody, getCommentsResponse } from "./model";
import { getComments } from "./services/get";
import { Elysia } from "elysia";
import { db } from "../../db/instance";

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
  );
