/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await */
import { testClient } from "hono/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as addModule from "./services/add/add.js";
import * as notifyModule from "./services/add/notify.js";
import * as deleteModule from "./services/delete.js";
import * as getModule from "./services/get.js";
import * as updateModule from "./services/update.js";
import { createTestCommentApp } from "./test-utils.js";

vi.mock(import("@/env.js"), () => ({
  env: {
    FRONTEND_URL: "http://localhost:3000",
  } as any,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("get comments", () => {
  it("should return comments", async () => {
    vi.spyOn(getModule, "getComments").mockImplementationOnce(async () => {
      const comments = [
        {
          data: {
            anonymousName: null,
            content: "comment 1",
            rawContent: "comment 1",
            createdAt: "1970-01-01T00:00:10.000Z",
            displayName: "admin",
            id: 1,
            parentId: null,
            path: "/",
            reactions: [],
            replyToId: null,
            updatedAt: "2000-01-01T00:00:00.000Z",
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
          children: {
            cursor: 0,
            hasMore: false,
            total: 1,
            data: [
              {
                anonymousName: null,
                content: "1 reply to 1",
                rawContent: "1 reply to 1",
                createdAt: "1970-01-01T00:00:15.000Z",
                displayName: "user",
                id: 1000,
                parentId: 1,
                path: "/",
                replyToId: 1,
                reactions: [],
                updatedAt: "2000-01-01T00:00:00.000Z",
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
          },
        },
      ];
      return { comments, total: comments.length, cursor: 0, hasMore: false };
    });

    const resp = await testClient(createTestCommentApp()).get.$post({
      json: {
        path: "/",
        limit: 10,
        sortBy: "created_desc",
      },
    });

    expect(resp.status).toBe(200);
    const respJson = await resp.json();
    expect(respJson.comments).toHaveLength(1);
    expect(respJson.comments[0].data.id).toBe(1);
    expect(respJson.comments[0].children.data).toHaveLength(1);
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
              createdAt: "1970-01-01T00:00:10.000Z",
              updatedAt: "2000-01-01T00:00:00.000Z",
              replyToId: null,
              reactions: [],
            },
            isSpam: false,
          },
        };
      },
    );
    vi.spyOn(notifyModule, "sendNotification").mockImplementationOnce(() => {});

    const resp = await testClient(createTestCommentApp()).add.$post(
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
    vi.spyOn(notifyModule, "sendNotification").mockImplementationOnce(() => {});

    const resp = await testClient(createTestCommentApp()).add.$post({
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
      createTestCommentApp({
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
    const resp = await testClient(createTestCommentApp()).delete.$post({
      json: { id: 1 },
    });

    expect(resp.status).toBe(401);
  });

  it("should forbidden", async () => {
    vi.spyOn(deleteModule, "deleteComment").mockImplementationOnce(async () => {
      return { result: "forbidden", message: "forbidden" };
    });

    const resp = await testClient(
      createTestCommentApp({
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
      createTestCommentApp({
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
      return {
        code: 200,
        data: {
          result: "success",
          data: {
            id: 1,
            displayName: "user",
            userImage: "",
            content: "test",
            rawContent: "test",
            parentId: null,
            path: "/",
            createdAt: "1970-01-01T00:00:10.000Z",
            updatedAt: "2000-01-01T00:00:00.000Z",
            replyToId: null,
            reactions: [],
          },
        },
      };
    });

    const resp = await testClient(
      createTestCommentApp({
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
    const resp = await testClient(createTestCommentApp()).update.$post({
      json: { id: 1, rawContent: "test" },
    });

    expect(resp.status).toBe(401);
  });

  it("should forbidden", async () => {
    vi.spyOn(updateModule, "updateComment").mockImplementationOnce(async () => {
      return { code: 403, data: "not authorized to update this comment" };
    });

    const resp = await testClient(
      createTestCommentApp({
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
      createTestCommentApp({
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
