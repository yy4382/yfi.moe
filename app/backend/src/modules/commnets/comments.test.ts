import { describe, expect, it, vi } from "vitest";
import { comments } from ".";
import * as getModule from "./services/get";
import { treaty } from "@elysiajs/eden";

vi.mock("@/auth/auth-plugin", async () => {
  const ElysiaInPlugin = await import("elysia");
  return {
    betterAuthPlugin: new ElysiaInPlugin.Elysia({ name: "better-auth" }).macro({
      auth: { resolve: () => ({ user: null, session: null }) },
    }) as any,
  };
});

describe("get comments", () => {
  it("should return comments", async () => {
    vi.spyOn(getModule, "getComments").mockImplementationOnce(async () => {
      return [
        {
          anonymousName: null,
          children: [
            {
              anonymousName: null,
              content: "1 reply to 1",
              createdAt: new Date("1970-01-01T00:00:15.000Z"),
              displayName: "user",
              id: 1000,
              parentId: 1,
              path: "/",
              replyToId: 1,
              updatedAt: new Date("2000-01-01T00:00:00.000Z"),
              userAgent: null,
              userEmail: "user@example.com",
              userId: "2",
              userImage:
                "https://www.gravatar.com/avatar/b58996c504c5638798eb6b511e6f49af?s=200&d=identicon&r=g",
              userIp: null,
              userName: "user",
              visitorEmail: null,
              visitorName: null,
            },
          ],
          content: "comment 1",
          createdAt: new Date("1970-01-01T00:00:10.000Z"),
          displayName: "admin",
          id: 1,
          parentId: null,
          path: "/",
          replyToId: null,
          updatedAt: new Date("2000-01-01T00:00:00.000Z"),
          userAgent: null,
          userEmail: "admin@example.com",
          userId: "1",
          userImage:
            "https://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=200&d=identicon&r=g",
          userIp: null,
          userName: "admin",
          visitorEmail: null,
          visitorName: null,
        },
      ];
    });
    const resp = await treaty(comments).comments.get.post({
      path: "/",
      limit: 10,
      offset: 0,
      sortBy: "created_desc",
    });
    expect(resp.status).toBe(200);
    expect(resp.data?.comments).toHaveLength(1);
    expect(resp.data?.comments[0].id).toBe(1);
    expect(resp.data?.comments[0].children).toHaveLength(1);
  });
});
