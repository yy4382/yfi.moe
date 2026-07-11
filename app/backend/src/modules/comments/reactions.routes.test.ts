/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await */
import { afterEach, describe, expect, it, vi } from "vitest";
import { GUEST_IDENTITY_HEADER } from "@repo/guest-identity";
import { GUEST_IDENTITY_COOKIE } from "@/modules/identity/guest-identity-plugin.js";
import * as addReactionModule from "./services/reaction/add.js";
import * as removeReactionModule from "./services/reaction/remove.js";
import { createTestCommentApp } from "./test-utils.js";

vi.mock(import("@/env.js"), () => ({
  env: {
    FRONTEND_URL: "http://localhost:3000",
  } as any,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("comment reactions", () => {
  it("should add reaction and set anon cookie", async () => {
    const mockResponse = {
      id: 10,
      emojiKey: "👍",
      emojiRaw: "👍🏿",
      user: { type: "guest" as const, key: "generated" },
    };
    const addSpy = vi
      .spyOn(addReactionModule, "addReaction")
      .mockImplementationOnce(async (commentId, emoji, actor) => {
        expect(commentId).toBe(1);
        expect(emoji).toBe("👍🏿");
        expect(actor).toMatchObject({ type: "guest" });
        return { result: "success", data: mockResponse };
      });

    const app = createTestCommentApp();
    const resp = await app.request("/reaction/1/add", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍🏿" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(resp.status).toBe(200);
    expect(await resp.json()).toEqual(mockResponse);
    expect(resp.headers.get("set-cookie")).toContain(GUEST_IDENTITY_COOKIE);
    expect(resp.headers.get(GUEST_IDENTITY_HEADER)).toBeTruthy();
    expect(addSpy).toHaveBeenCalledTimes(1);
  });

  it("should return 404 when reaction target comment missing", async () => {
    vi.spyOn(addReactionModule, "addReaction").mockResolvedValueOnce({
      result: "not_found",
      message: "comment not found",
    });

    const app = createTestCommentApp();
    const resp = await app.request("/reaction/1/add", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(resp.status).toBe(404);
    expect(await resp.text()).toBe("comment not found");
    expect(resp.headers.get("set-cookie")).toBeNull();
    expect(resp.headers.get(GUEST_IDENTITY_HEADER)).toBeNull();
  });

  it("should reject invalid comment id on add", async () => {
    const app = createTestCommentApp();
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

    const app = createTestCommentApp();
    const resp = await app.request("/reaction/1/remove", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍" }),
      headers: {
        "Content-Type": "application/json",
        Cookie: `${GUEST_IDENTITY_COOKIE}=anon-key`,
      },
    });

    expect(resp.status).toBe(204);
    expect(removeSpy).toHaveBeenCalledWith(
      1,
      "👍",
      [expect.objectContaining({ type: "guest", key: "anon-key" })],
      expect.any(Object),
    );
  });

  it("should skip remove handler when actor missing", async () => {
    const removeSpy = vi.spyOn(removeReactionModule, "removeReaction");

    const app = createTestCommentApp();
    const resp = await app.request("/reaction/1/remove", {
      method: "POST",
      body: JSON.stringify({ emoji: "👍" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(resp.status).toBe(204);
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
