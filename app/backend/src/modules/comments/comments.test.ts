/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await  */
import { afterEach, describe, expect, it, vi } from "vitest";
import commentApp from "./index.js";
import * as getModule from "./services/get.js";
import * as addModule from "./services/add/add.js";
import * as updateModule from "./services/update.js";
import * as notifyModule from "./services/add/notify.js";
import { testClient } from "hono/testing";
import { factory, type Variables } from "@/factory.js";
import * as deleteModule from "./services/delete.js";
import {
  anonymousIdentityPlugin,
  ANONYMOUS_IDENTITY_COOKIE,
  ANONYMOUS_IDENTITY_HEADER,
} from "@/plugins/anonymous-identity.js";
import * as addReactionModule from "./services/reaction/add.js";
import * as removeReactionModule from "./services/reaction/remove.js";
import type { NotificationService } from "@/notification/types.js";
import pino from "pino";

vi.mock(import("@/env.js"), () => ({
  env: {
    FRONTEND_URL: "http://localhost:3000",
  } as any,
}));

const testCommentApp = (
  auth: Variables["auth"] = undefined,
  db: Variables["db"] = {} as any,
  authClient: Variables["authClient"] = {} as any,
) =>
  factory
    .createApp()
    .use(anonymousIdentityPlugin())
    .use(async (c, next) => {
      c.set("db", db);
      c.set("authClient", authClient);
      c.set("auth", auth);
      c.set("notification", {} as NotificationService);
      c.set(
        "logger",
        pino({
          transport: {
            targets: [],
          },
        }),
      );
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
    vi.spyOn(notifyModule, "sendNotification").mockImplementationOnce(() => {});
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

describe("comment reactions", () => {
  it("should add reaction and set anon cookie", async () => {
    const mockResponse = {
      id: 10,
      emojiKey: "👍",
      emojiRaw: "👍🏿",
      user: { type: "anonymous" as const, key: "generated" },
    };
    const addSpy = vi
      .spyOn(addReactionModule, "addReaction")
      .mockImplementationOnce(async (commentId, emoji, actor) => {
        expect(commentId).toBe(1);
        expect(emoji).toBe("👍🏿");
        expect(actor).toMatchObject({ type: "anonymous" });
        return { result: "success", data: mockResponse };
      });

    const app = testCommentApp();
    const resp = await app.request("/reaction/1/add", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍🏿" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(resp.status).toBe(200);
    expect(await resp.json()).toEqual(mockResponse);
    expect(resp.headers.get("set-cookie")).toContain(ANONYMOUS_IDENTITY_COOKIE);
    expect(resp.headers.get(ANONYMOUS_IDENTITY_HEADER)).toBeTruthy();
    expect(addSpy).toHaveBeenCalledTimes(1);
  });

  it("should return 404 when reaction target comment missing", async () => {
    vi.spyOn(addReactionModule, "addReaction").mockResolvedValueOnce({
      result: "not_found",
      message: "comment not found",
    });

    const app = testCommentApp();
    const resp = await app.request("/reaction/1/add", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(resp.status).toBe(404);
    expect(await resp.text()).toBe("comment not found");
    expect(resp.headers.get(ANONYMOUS_IDENTITY_HEADER)).toBeTruthy();
  });

  it("should reject invalid comment id on add", async () => {
    const app = testCommentApp();
    const resp = await app.request("/reaction/abc/add", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(resp.status).toBe(400);
    expect(await resp.text()).toBe("invalid comment id");
  });

  it("should remove reaction when anon cookie present", async () => {
    const removeSpy = vi
      .spyOn(removeReactionModule, "removeReaction")
      .mockResolvedValueOnce({ result: "success" });

    const app = testCommentApp();
    const resp = await app.request("/reaction/1/remove", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍" }),
      headers: {
        "Content-Type": "application/json",
        Cookie: `${ANONYMOUS_IDENTITY_COOKIE}=anon-key`,
      },
    });

    expect(resp.status).toBe(204);
    expect(removeSpy).toHaveBeenCalledWith(
      1,
      "👍",
      expect.objectContaining({ type: "anonymous", key: "anon-key" }),
      expect.any(Object),
    );
  });

  it("should skip remove handler when actor missing", async () => {
    const removeSpy = vi.spyOn(removeReactionModule, "removeReaction");

    const app = testCommentApp();
    const resp = await app.request("/reaction/1/remove", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(resp.status).toBe(204);
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
