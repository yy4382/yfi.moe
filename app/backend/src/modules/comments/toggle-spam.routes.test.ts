/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Variables } from "@/factory.js";
import * as toggleSpamModule from "./services/toggle-spam.js";
import { createTestCommentApp } from "./test-utils.js";

vi.mock(import("@/env.js"), () => ({
  env: { FRONTEND_URL: "http://localhost:3000" } as any,
}));

afterEach(() => vi.restoreAllMocks());

describe("comment moderation route", () => {
  it("passes an authenticated admin to the spam policy", async () => {
    const auth = {
      user: {
        id: "admin-1",
        name: "E2E Admin",
        email: "admin@example.com",
        role: "admin",
      },
      session: {},
    } as Variables["auth"];
    const toggle = vi
      .spyOn(toggleSpamModule, "toggleCommentSpam")
      .mockResolvedValueOnce({ code: 200, data: { success: true } });

    const response = await createTestCommentApp(auth).request("/toggle-spam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 42, isSpam: true }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(toggle).toHaveBeenCalledWith(
      42,
      true,
      expect.objectContaining({
        user: expect.objectContaining({ id: "admin-1", role: "admin" }),
      }),
    );
  });
});
