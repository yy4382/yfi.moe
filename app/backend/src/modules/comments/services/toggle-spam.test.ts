/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { toggleCommentSpam } from "./toggle-spam.js";
import type { DbClient } from "@/db/db-plugin.js";
import type { User } from "@/auth/auth-plugin.js";
import type { AkismetService } from "@/services/akismet.js";

// Mock environment variables
vi.mock("@/env.js", () => ({
  env: {
    FRONTEND_URL: "http://localhost:3000",
  },
}));

// Mock database and comment schema
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

const mockAkismet = {
  submitSpam: vi.fn(),
  submitHam: vi.fn(),
};

describe("toggleCommentSpam", () => {
  let adminUser: User;
  let regularUser: User;

  beforeEach(() => {
    vi.clearAllMocks();

    adminUser = {
      id: "admin-1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    } as User;

    regularUser = {
      id: "user-1",
      name: "Regular User",
      email: "user@example.com",
      role: "user",
    } as User;
  });

  it("should allow admin to mark comment as spam", async () => {
    const mockComment = {
      id: 1,
      rawContent: "This is spam",
      userIp: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      visitorName: "Spammer",
      visitorEmail: "spam@example.com",
      path: "/blog/post",
      isSpam: false,
      deletedAt: null,
    };

    mockDb.limit.mockResolvedValue([mockComment]);
    mockDb.returning.mockResolvedValue([{ ...mockComment, isSpam: true }]);
    vi.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00Z"));

    const result = await toggleCommentSpam(1, true, {
      db: mockDb as unknown as DbClient,
      user: adminUser,
      akismet: mockAkismet as unknown as AkismetService,
    });

    expect(result.code).toBe(200);
    expect(result.data).toEqual({ success: true });
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.set).toHaveBeenCalledWith({
      isSpam: true,
      updatedAt: new Date(),
    });
    expect(mockAkismet.submitSpam).toHaveBeenCalledWith({
      content: "This is spam",
      userIp: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      author: "Spammer",
      authorEmail: "spam@example.com",
      permalink: expect.stringContaining("/blog/post"),
    });
  });

  it("should allow admin to mark comment as not spam (ham)", async () => {
    const mockComment = {
      id: 1,
      rawContent: "This is legitimate content",
      userIp: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      visitorName: "Real User",
      visitorEmail: "user@example.com",
      path: "/blog/post",
      isSpam: true,
      deletedAt: null,
    };

    mockDb.limit.mockResolvedValue([mockComment]);
    mockDb.returning.mockResolvedValue([{ ...mockComment, isSpam: false }]);

    const result = await toggleCommentSpam(1, false, {
      db: mockDb as unknown as DbClient,
      user: adminUser,
      akismet: mockAkismet as unknown as AkismetService,
    });

    expect(result.code).toBe(200);
    expect(result.data).toEqual({ success: true });
    expect(mockAkismet.submitHam).toHaveBeenCalledWith({
      content: "This is legitimate content",
      userIp: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      author: "Real User",
      authorEmail: "user@example.com",
      permalink: expect.stringContaining("/blog/post"),
    });
  });

  it("should reject non-admin users", async () => {
    const result = await toggleCommentSpam(1, true, {
      db: mockDb as unknown as DbClient,
      user: regularUser,
      akismet: mockAkismet as unknown as AkismetService,
    });

    expect(result.code).toBe(403);
    expect(result.data).toBe("Only admins can toggle spam status");
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("should reject unauthenticated users", async () => {
    const result = await toggleCommentSpam(1, true, {
      db: mockDb as unknown as DbClient,
      user: null,
      akismet: mockAkismet as unknown as AkismetService,
    });

    expect(result.code).toBe(401);
    expect(result.data).toBe("Authentication required");
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("should handle comment not found", async () => {
    mockDb.limit.mockResolvedValue([]);

    const result = await toggleCommentSpam(1, true, {
      db: mockDb as unknown as DbClient,
      user: adminUser,
      akismet: mockAkismet as unknown as AkismetService,
    });

    expect(result.code).toBe(404);
    expect(result.data).toBe("Comment not found");
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("should work without Akismet service", async () => {
    const mockComment = {
      id: 1,
      rawContent: "Content",
      path: "/blog/post",
      isSpam: false,
      deletedAt: null,
    };

    mockDb.limit.mockResolvedValue([mockComment]);
    mockDb.returning.mockResolvedValue([{ ...mockComment, isSpam: true }]);

    const result = await toggleCommentSpam(1, true, {
      db: mockDb as unknown as DbClient,
      user: adminUser,
      akismet: null,
    });

    expect(result.code).toBe(200);
    expect(result.data).toEqual({ success: true });
    expect(mockDb.update).toHaveBeenCalled();
  });
});
