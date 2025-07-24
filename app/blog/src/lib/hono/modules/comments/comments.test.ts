/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, describe, expect, it, vi } from "vitest";
import commentApp from ".";
import * as getModule from "./services/get";
import * as addModule from "./services/add";
import * as updateModule from "./services/update";
import * as notifyModule from "./services/notify";
import { testClient } from "hono/testing";
import { factory, Variables } from "@/lib/hono/factory";
import * as deleteModule from "./services/delete";
import { NotificationService } from "@/lib/hono/notification/types";

const testCommentApp = (
  auth: Variables["auth"] = undefined,
  db: Variables["db"] = {} as any,
  authClient: Variables["authClient"] = {} as any,
) =>
  factory
    .createApp()
    .use(async (c, next) => {
      c.set("db", db);
      c.set("authClient", authClient);
      c.set("auth", auth);
      c.set("notification", {} as NotificationService);
      await next();
    })
    .route("/", commentApp);

afterEach(() => {
  vi.clearAllMocks();
});

describe("get comments", () => {
  it("should return comments", async () => {
    vi.spyOn(getModule, "getComments").mockImplementationOnce(async () => {
      const comments = [
        {
          anonymousName: null,
          children: [
            {
              anonymousName: null,
              content: "1 reply to 1",
              rawContent: "1 reply to 1",
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
          rawContent: "comment 1",
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
      return { comments, total: comments.length };
    });
    const resp = await testClient(testCommentApp()).get.$post({
      json: {
        path: "/",
        limit: 10,
        offset: 0,
        sortBy: "created_desc",
      },
    });
    expect(resp.status).toBe(200);
    const respJson = await resp.json();
    expect(respJson.comments).toHaveLength(1);
    expect(respJson.comments[0].id).toBe(1);
    expect(respJson.comments[0].children).toHaveLength(1);
  });
});

describe("add comment", () => {
  it("should add comment", async () => {
    let ipReqGot: string | undefined = undefined;
    let uaReqGot: string | undefined = undefined;
    vi.spyOn(addModule, "addComment").mockImplementationOnce(
      async (_, options) => {
        ipReqGot = options.ip;
        uaReqGot = options.ua;
        return {
          result: "success",
          data: {
            data: {
              id: 1,
              displayName: "user",
              userImage: "",
              content: "test",
              rawContent: "test",
              parentId: null,
              path: "/",
              createdAt: new Date("1970-01-01T00:00:10.000Z"),
              updatedAt: new Date("2000-01-01T00:00:00.000Z"),
              replyToId: null,
            },
            isSpam: false,
          },
        };
      },
    );
    vi.spyOn(notifyModule, "sendNotification").mockImplementationOnce(
      async () => {
        return Promise.resolve();
      },
    );
    const resp = await testClient(testCommentApp()).add.$post(
      {
        json: {
          path: "/",
          content: "test",
        },
      },
      {
        headers: {
          "x-forwarded-for": "127.0.0.11",
          "user-agent": "test-ua",
        },
      },
    );
    expect(resp.status).toBe(200);
    const respJson = await resp.json();
    expect(respJson.data.id).toBe(1);
    expect(ipReqGot).toBe("127.0.0.11");
    expect(uaReqGot).toBe("test-ua");
  });

  it("should handle error", async () => {
    vi.spyOn(addModule, "addComment").mockImplementationOnce(async () => {
      return { result: "bad_req", data: { message: "test" } };
    });
    vi.spyOn(notifyModule, "sendNotification").mockImplementationOnce(
      async () => {
        return Promise.resolve();
      },
    );
    const resp = await testClient(testCommentApp()).add.$post({
      json: {
        path: "/",
        content: "test",
      },
    });

    expect(resp.status).toBe(400);
    expect(await resp.text()).toBe("test");
  });
});

describe("delete comment", () => {
  it("should delete comment", async () => {
    vi.spyOn(deleteModule, "deleteComment").mockImplementationOnce(async () => {
      return { result: "success", deletedIds: [1] };
    });
    const resp = await testClient(
      testCommentApp({
        user: "something" as any,
        session: "something" as any,
      }),
    ).delete.$post({
      json: { id: 1 },
    });
    expect(resp.status).toBe(200);
    const respJson = await resp.json();
    expect(respJson.deletedIds).toEqual([1]);
  });
  it("should unauthorized", async () => {
    const resp = await testClient(testCommentApp()).delete.$post({
      json: { id: 1 },
    });
    expect(resp.status).toBe(401);
  });
  it("should forbidden", async () => {
    vi.spyOn(deleteModule, "deleteComment").mockImplementationOnce(async () => {
      return { result: "forbidden", message: "forbidden" };
    });
    const resp = await testClient(
      testCommentApp({
        user: "something" as any,
        session: "something" as any,
      }),
    ).delete.$post({
      json: { id: 1 },
    });
    expect(resp.status).toBe(403);
    expect(await resp.text()).toBe("forbidden");
  });
  it("should not found", async () => {
    vi.spyOn(deleteModule, "deleteComment").mockImplementationOnce(async () => {
      return { result: "not_found", message: "not found" };
    });
    const resp = await testClient(
      testCommentApp({
        user: "something" as any,
        session: "something" as any,
      }),
    ).delete.$post({
      json: { id: 1 },
    });
    expect(resp.status).toBe(404);
    expect(await resp.text()).toBe("not found");
  });
});

describe("update comment", () => {
  it("should update comment", async () => {
    vi.spyOn(updateModule, "updateComment").mockImplementationOnce(async () => {
      return { code: 200, data: { result: "success" } };
    });
    const resp = await testClient(
      testCommentApp({
        user: "something" as any,
        session: "something" as any,
      }),
    ).update.$post({
      json: {
        id: 1,
        rawContent: "test",
      },
    });
    expect(resp.status).toBe(200);
    const respJson = await resp.json();
    expect(respJson.result).toBe("success");
  });
  it("should unauthorized", async () => {
    const resp = await testClient(testCommentApp()).update.$post({
      json: { id: 1, rawContent: "test" },
    });
    expect(resp.status).toBe(401);
  });
  it("should forbidden", async () => {
    vi.spyOn(updateModule, "updateComment").mockImplementationOnce(async () => {
      return { code: 403, data: "not authorized to update this comment" };
    });
    const resp = await testClient(
      testCommentApp({
        user: "something" as any,
        session: "something" as any,
      }),
    ).update.$post({
      json: { id: 1, rawContent: "test" },
    });
    expect(resp.status).toBe(403);
    expect(await resp.text()).toBe("not authorized to update this comment");
  });
  it("should not found", async () => {
    vi.spyOn(updateModule, "updateComment").mockImplementationOnce(async () => {
      return { code: 404, data: "comment not found" };
    });
    const resp = await testClient(
      testCommentApp({
        user: "something" as any,
        session: "something" as any,
      }),
    ).update.$post({
      json: { id: 1, rawContent: "test" },
    });
    expect(resp.status).toBe(404);
    expect(await resp.text()).toBe("comment not found");
  });
});
