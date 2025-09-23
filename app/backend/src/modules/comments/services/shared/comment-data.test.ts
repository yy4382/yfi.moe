import { describe, it, expect, vi, beforeEach } from "vitest";
import { tablesToCommentData } from "./comment-data.js";
import type { InferSelectModel } from "drizzle-orm";
import type { comment, user } from "@/db/schema.js";
import type { User } from "@/auth/auth-plugin.js";
import { z } from "zod";
import SparkMD5 from "spark-md5";

vi.mock("@repo/helpers/get-gravatar-url", () => ({
  getGravatarUrl: vi.fn(
    (email: string) => `https://gravatar.com/avatar/${email}`,
  ),
  getDiceBearUrl: vi.fn(
    (seed: string) => `https://gravatar.com/avatar/${seed}`,
  ),
}));

describe("tablesToCommentData", () => {
  const mockCommentTableData: InferSelectModel<typeof comment> = {
    id: 1,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T11:00:00Z"),
    rawContent: "This is a test comment",
    renderedContent: "<p>This is a test comment</p>",
    path: "/blog/test-post",
    parentId: null,
    replyToId: null,
    deletedAt: null,
    userId: "user123",
    userIp: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    visitorName: null,
    visitorEmail: null,
    anonymousName: null,
    isSpam: false,
  };

  const mockUserTableData: InferSelectModel<typeof user> = {
    id: "user123",
    email: "test@example.com",
    emailVerified: true,
    name: "Test User",
    createdAt: new Date("2024-01-01T09:00:00Z"),
    updatedAt: new Date("2024-01-01T09:30:00Z"),
    image: "https://example.com/avatar.jpg",
    banned: false,
    role: "user",
    banReason: null,
    banExpires: null,
  };

  const noReactions: Parameters<typeof tablesToCommentData>[2] = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("admin context", () => {
    it("should return full comment data for admin with logged in user", () => {
      const result = tablesToCommentData(
        mockCommentTableData,
        mockUserTableData,
        noReactions,
        true,
      );

      expect(result).toEqual({
        id: 1,
        content: "<p>This is a test comment</p>",
        rawContent: "This is a test comment",
        path: "/blog/test-post",
        parentId: null,
        replyToId: null,
        reactions: [],
        createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
        updatedAt: new Date("2024-01-01T11:00:00Z").toISOString(),
        displayName: "Test User",
        anonymousName: null,
        userImage: "https://example.com/avatar.jpg",
        userId: "user123",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        userName: "Test User",
        userEmail: "test@example.com",
        visitorName: null,
        visitorEmail: null,
        isSpam: false,
      });
    });

    it("should return admin data for anonymous comment", () => {
      const anonymousComment = {
        ...mockCommentTableData,
        userId: null,
        anonymousName: "Anonymous User",
      };

      const result = tablesToCommentData(
        anonymousComment,
        null,
        noReactions,
        true,
      );

      expect(result).toEqual({
        id: 1,
        content: "<p>This is a test comment</p>",
        rawContent: "This is a test comment",
        path: "/blog/test-post",
        parentId: null,
        replyToId: null,
        reactions: [],
        createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
        updatedAt: new Date("2024-01-01T11:00:00Z").toISOString(),
        displayName: "Anonymous User",
        anonymousName: "Anonymous User",
        userImage: "https://avatar.vercel.sh/anonymous",
        userId: undefined,
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        userName: undefined,
        userEmail: undefined,
        visitorName: null,
        visitorEmail: null,
        isSpam: false,
      });
    });

    it("should return admin data for visitor comment", () => {
      const visitorComment = {
        ...mockCommentTableData,
        userId: null,
        visitorName: "Visitor Name",
        visitorEmail: "visitor@example.com",
      };

      const result = tablesToCommentData(
        visitorComment,
        null,
        noReactions,
        true,
      );

      expect(result).toEqual({
        id: 1,
        content: "<p>This is a test comment</p>",
        rawContent: "This is a test comment",
        path: "/blog/test-post",
        parentId: null,
        replyToId: null,
        reactions: [],
        createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
        updatedAt: new Date("2024-01-01T11:00:00Z").toISOString(),
        displayName: "Visitor Name",
        anonymousName: null,
        userImage: "https://gravatar.com/avatar/visitor@example.com",
        userId: undefined,
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        userName: undefined,
        userEmail: undefined,
        visitorName: "Visitor Name",
        visitorEmail: "visitor@example.com",
        isSpam: false,
      });
    });

    it("should handle User type from auth plugin", () => {
      const authUser: User = {
        id: "auth-user-123",
        email: "auth@example.com",
        name: "Auth User",
        image: "https://auth.example.com/avatar.jpg",
        emailVerified: true,
        createdAt: new Date("2024-01-01T08:00:00Z"),
        updatedAt: new Date("2024-01-01T08:30:00Z"),
        banned: false,
      };

      const result = tablesToCommentData(
        mockCommentTableData,
        authUser,
        noReactions,
        true,
      );

      expect(result).toEqual({
        id: 1,
        content: "<p>This is a test comment</p>",
        rawContent: "This is a test comment",
        path: "/blog/test-post",
        parentId: null,
        replyToId: null,
        reactions: [],
        createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
        updatedAt: new Date("2024-01-01T11:00:00Z").toISOString(),
        displayName: "Auth User",
        anonymousName: null,
        userImage: "https://auth.example.com/avatar.jpg",
        userId: "auth-user-123",
        userIp: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        userName: "Auth User",
        userEmail: "auth@example.com",
        visitorName: null,
        visitorEmail: null,
        isSpam: false,
      });
    });
  });

  describe("non-admin context", () => {
    it("should return limited comment data for non-admin with logged in user", () => {
      const result = tablesToCommentData(
        mockCommentTableData,
        mockUserTableData,
        noReactions,
        false,
      );

      expect(result).toEqual({
        id: 1,
        content: "<p>This is a test comment</p>",
        rawContent: "This is a test comment",
        path: "/blog/test-post",
        parentId: null,
        replyToId: null,
        reactions: [],
        createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
        updatedAt: new Date("2024-01-01T11:00:00Z").toISOString(),
        displayName: "Test User",
        anonymousName: null,
        userImage: "https://example.com/avatar.jpg",
        userId: "user123",
      });
    });

    it("should hide userId for anonymous comments in non-admin context", () => {
      const anonymousComment = {
        ...mockCommentTableData,
        userId: null,
        anonymousName: "Anonymous User",
      };

      const result = tablesToCommentData(
        anonymousComment,
        mockUserTableData,
        noReactions,
        false,
      );

      expect(result).toEqual({
        id: 1,
        content: "<p>This is a test comment</p>",
        rawContent: "This is a test comment",
        path: "/blog/test-post",
        parentId: null,
        replyToId: null,
        reactions: [],
        createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
        updatedAt: new Date("2024-01-01T11:00:00Z").toISOString(),
        displayName: "Anonymous User",
        anonymousName: "Anonymous User",
        userImage: "https://avatar.vercel.sh/anonymous",
        userId: null,
      });
    });

    it("should return non-admin data for visitor comment", () => {
      const visitorComment = {
        ...mockCommentTableData,
        userId: null,
        visitorName: "Visitor Name",
        visitorEmail: "visitor@example.com",
      };

      const result = tablesToCommentData(
        visitorComment,
        null,
        noReactions,
        false,
      );

      expect(result).toEqual({
        id: 1,
        content: "<p>This is a test comment</p>",
        rawContent: "This is a test comment",
        path: "/blog/test-post",
        parentId: null,
        replyToId: null,
        reactions: [],
        createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
        updatedAt: new Date("2024-01-01T11:00:00Z").toISOString(),
        displayName: "Visitor Name",
        anonymousName: null,
        userImage: "https://gravatar.com/avatar/visitor@example.com",
        userId: undefined,
      });
    });
  });

  describe("edge cases", () => {
    it("should handle null user data", () => {
      const result = tablesToCommentData(
        mockCommentTableData,
        null,
        noReactions,
        true,
      );

      expect(result.displayName).toBe("Unknown");
      expect(result.userId).toBeUndefined();
      expect(result.userName).toBeUndefined();
      expect(result.userEmail).toBeUndefined();
    });

    it("should prioritize display name sources correctly", () => {
      const commentWithMultipleNames = {
        ...mockCommentTableData,
        anonymousName: "Anonymous",
        visitorName: "Visitor",
      };

      const result = tablesToCommentData(
        commentWithMultipleNames,
        mockUserTableData,
        noReactions,
        true,
      );

      expect(result.displayName).toBe("Anonymous");
    });

    it("should fall back to Unknown when no names available", () => {
      const commentNoNames = {
        ...mockCommentTableData,
        anonymousName: null,
        visitorName: null,
      };

      const result = tablesToCommentData(
        commentNoNames,
        null,
        noReactions,
        true,
      );

      expect(result.displayName).toBe("Unknown");
    });

    it("should handle nested comments with parentId and replyToId", () => {
      const nestedComment = {
        ...mockCommentTableData,
        parentId: 5,
        replyToId: 3,
      };

      const result = tablesToCommentData(
        nestedComment,
        mockUserTableData,
        noReactions,
        true,
      );

      expect(result.parentId).toBe(5);
      expect(result.replyToId).toBe(3);
    });

    it("should handle spam comments", () => {
      const spamComment = {
        ...mockCommentTableData,
        isSpam: true,
      };

      const result = tablesToCommentData(
        spamComment,
        mockUserTableData,
        noReactions,
        true,
      );

      expect(result.isSpam).toBe(true);
    });

    it("should handle user with no image", () => {
      const userNoImage = {
        ...mockUserTableData,
        image: null,
      };

      const result = tablesToCommentData(
        mockCommentTableData,
        userNoImage,
        noReactions,
        true,
      );

      expect(result.userImage).toBe("https://gravatar.com/avatar/user123");
    });

    it("should handle anonymous user image for admin when userTableData exists", () => {
      const anonymousComment = {
        ...mockCommentTableData,
        anonymousName: "Anonymous",
        userId: null,
      };

      const result = tablesToCommentData(
        anonymousComment,
        mockUserTableData,
        noReactions,
        true,
      );

      expect(result.userImage).toBe("https://avatar.vercel.sh/anonymous");
      expect(result.userId).toBe("user123");
    });

    it("should handle date coercion correctly", () => {
      const result = tablesToCommentData(
        mockCommentTableData,
        mockUserTableData,
        noReactions,
        true,
      );

      expect(() => z.iso.datetime().parse(result.createdAt)).not.toThrow();
      expect(() => z.iso.datetime().parse(result.updatedAt)).not.toThrow();
    });
  });

  describe("reactions", () => {
    it("should map user and anonymous reactions", () => {
      const reactionUser: InferSelectModel<typeof user> = {
        ...mockUserTableData,
        id: "reactor-user",
        email: "reactor@example.com",
        name: "Reactor User",
        image: "https://example.com/reactor.png",
        createdAt: new Date("2024-01-02T09:00:00Z"),
        updatedAt: new Date("2024-01-02T09:30:00Z"),
      };

      const reactionData: Parameters<typeof tablesToCommentData>[2] = [
        {
          reaction: {
            id: 10,
            commentId: mockCommentTableData.id,
            actorId: "reactor-user",
            actorAnonKey: null,
            emojiKey: "thumbs_up",
            emojiRaw: "👍",
            createdAt: new Date("2024-01-02T12:00:00Z"),
          },
          user: reactionUser,
        },
        {
          reaction: {
            id: 11,
            commentId: mockCommentTableData.id,
            actorId: null,
            actorAnonKey: "anon-key",
            emojiKey: "heart",
            emojiRaw: "❤️",
            createdAt: new Date("2024-01-02T12:05:00Z"),
          },
          user: null,
        },
      ];

      const result = tablesToCommentData(
        mockCommentTableData,
        mockUserTableData,
        reactionData,
        true,
      );

      expect(result.reactions).toEqual([
        {
          id: 10,
          emojiKey: "thumbs_up",
          emojiRaw: "👍",
          user: {
            type: "user",
            id: "reactor-user",
            name: "Reactor User",
            image: "https://example.com/reactor.png",
          },
        },
        {
          id: 11,
          emojiKey: "heart",
          emojiRaw: "❤️",
          user: {
            type: "anonymous",
            key: SparkMD5.hash("anon-key"),
          },
        },
      ]);
    });

    it("should fall back to generated avatar when reaction user has no image", () => {
      const reactionUserWithoutImage: InferSelectModel<typeof user> = {
        ...mockUserTableData,
        id: "reactor-no-image",
        email: "reactor-no-image@example.com",
        name: "Reactor No Image",
        image: null,
        createdAt: new Date("2024-01-02T10:00:00Z"),
        updatedAt: new Date("2024-01-02T10:30:00Z"),
      };

      const reactionData: Parameters<typeof tablesToCommentData>[2] = [
        {
          reaction: {
            id: 12,
            commentId: mockCommentTableData.id,
            actorId: "reactor-no-image",
            actorAnonKey: null,
            emojiKey: "sparkles",
            emojiRaw: "✨",
            createdAt: new Date("2024-01-02T12:10:00Z"),
          },
          user: reactionUserWithoutImage,
        },
      ];

      const result = tablesToCommentData(
        mockCommentTableData,
        mockUserTableData,
        reactionData,
        true,
      );

      expect(result.reactions).toEqual([
        {
          id: 12,
          emojiKey: "sparkles",
          emojiRaw: "✨",
          user: {
            type: "user",
            id: "reactor-no-image",
            name: "Reactor No Image",
            image: "https://gravatar.com/avatar/reactor-no-image",
          },
        },
      ]);
    });
  });
});
