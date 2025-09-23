/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * This test file aims to test the `getComments` func in get-comment service.
 *
 * Should be tested:
 * - returns proper rows from db
 *   - take into account: spam, deleted, path, user role, etc.
 * - layered comments are properly created
 * - pagination works properly
 * - sorting works properly
 *
 * Should not be tested:
 * - which fields in a row should be returned to user
 *   - due to user role difference, some fields are only returned to admin or to owner
 *   - this is achieved by a shared function `tablesToCommentData`
 *   - should test it separately
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/libsql";
import { getComments, getCommentsChildren } from "./get.js";
import * as schema from "@/db/schema.js";
import { eq } from "drizzle-orm";
import type { DbClient } from "@/db/db-plugin.js";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import SparkMD5 from "spark-md5";

let client: Client;
let db: DbClient;

const { user, comment, reaction } = schema;

const mockUser: (typeof user.$inferInsert)[] = [
  {
    id: "1",
    name: "admin",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "2",
    name: "user1",
    email: "user1@example.com",
    role: "user",
  },
  {
    id: "3",
    name: "user2",
    email: "user2@example.com",
    role: "user",
  },
];

const makeComment = (
  args: Partial<typeof comment.$inferInsert>,
): typeof comment.$inferInsert => {
  if (!args.rawContent) {
    throw new Error("rawContent is required");
  }
  return {
    path: "/",
    isSpam: false,
    rawContent: args.rawContent,
    renderedContent: args.rawContent,
    ...args,
  };
};

const makeMockComment = () => {
  const mockComment: (typeof comment.$inferInsert)[] = [];
  let count = 1;
  for (const isSpam of [false, true]) {
    for (const anonymous of [false, true]) {
      for (const userData of mockUser) {
        const comment = makeComment({
          id: count++,
          rawContent: `comment ${count} from "${userData.name}" role "${userData.role}" isSpam "${isSpam}" anonymous "${anonymous}"`,
          createdAt: new Date(count * 10000),
          isSpam,
          userId: userData.id,
        });
        if (anonymous) {
          comment.anonymousName = "Anonymous";
        }
        mockComment.push(comment);
      }
      mockComment.push(
        makeComment({
          id: count++,
          rawContent: `comment ${count} from "Visitor" role "visitor" isSpam "${isSpam}" anonymous "${anonymous}"`,
          visitorName: "Visitor",
          visitorEmail: "visitor@example.com",
          createdAt: new Date(count * 10000),
          isSpam,
          anonymousName: anonymous ? "Anonymous" : undefined,
        }),
      );
    }
  }

  const parentId = count;
  const parentComment = makeComment({
    id: parentId,
    rawContent: `comment ${parentId} will be parent`,
    createdAt: new Date(parentId * 10000),
    userId: "1",
  });
  mockComment.push(parentComment);
  count++;
  const firstReplyId = count;
  for (let i = 0; i < 2; i++) {
    const comment = makeComment({
      id: count++,
      rawContent: `reply ${count} to comment ${parentId}`,
      createdAt: new Date(count * 10000),
      parentId,
      replyToId: parentId,
      userId: "1",
    });
    mockComment.push(comment);
  }
  mockComment.push(
    makeComment({
      id: count++,
      rawContent: `reply to reply to comment ${parentId}`,
      createdAt: new Date(count * 10000),
      parentId,
      replyToId: firstReplyId,
      userId: "1",
    }),
  );
  mockComment.push(
    makeComment({
      id: count++,
      rawContent: `reply to reply to reply to comment ${parentId}`,
      createdAt: new Date(count * 10000),
      parentId,
      replyToId: firstReplyId,
      deletedAt: new Date(count * 1000000),
      userId: "1",
    }),
  );
  return mockComment;
};

const mockComment: (typeof comment.$inferInsert)[] = makeMockComment();
const targetCommentId = mockComment[0]?.id ?? 1;
const reactionFixtures: (typeof reaction.$inferInsert)[] = [
  {
    id: 1,
    commentId: targetCommentId,
    actorId: "2",
    actorAnonKey: null,
    emojiKey: "thumbs_up",
    emojiRaw: "👍",
    createdAt: new Date("2024-01-02T12:00:00Z"),
  },
  {
    id: 2,
    commentId: targetCommentId,
    actorId: null,
    actorAnonKey: "anon-key",
    emojiKey: "heart",
    emojiRaw: "❤️",
    createdAt: new Date("2024-01-02T12:05:00Z"),
  },
];

describe("admin / user views", () => {
  beforeEach(async () => {
    client = createClient({ url: ":memory:" });
    db = drizzle({ client, schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    vi.setSystemTime(new Date("2000-01-01T00:00:00.000Z"));

    await db.insert(user).values(mockUser);
    await db.insert(comment).values(mockComment);
    await db.insert(reaction).values(reactionFixtures);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should include reactions metadata for admin", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 1000, sortBy: "created_asc" },
      { db, user: admin },
    );

    const commentWithReactions = comments.find(
      (c) => c.data.id === targetCommentId,
    );
    expect(commentWithReactions).toBeDefined();
    expect(commentWithReactions!.data.reactions).toHaveLength(2);
    expect(commentWithReactions!.data.reactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          emojiKey: "thumbs_up",
          emojiRaw: "👍",
          user: expect.objectContaining({
            type: "user",
            id: "2",
            name: "user1",
            image: expect.stringContaining("seed=2"),
          }),
        }),
        expect.objectContaining({
          id: 2,
          emojiKey: "heart",
          emojiRaw: "❤️",
          user: { type: "anonymous", key: SparkMD5.hash("anon-key") },
        }),
      ]),
    );
  });
  it("should include spam comments in admin", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 1000, sortBy: "created_asc" },
      { db, user: admin },
    );
    expect(comments.find((c) => c.data.isSpam)).toBeDefined();
  });
  it("should not include spam comments", async () => {
    const user1 = (await db.select().from(user).where(eq(user.id, "2")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 1000, sortBy: "created_asc" },
      { db, user: user1 },
    );
    expect(comments.find((c) => c.data.isSpam)).toBeUndefined();
  });
});

function makeCommentFromId(
  id: number,
  parent: number | null,
): typeof comment.$inferInsert {
  return {
    id,
    parentId: parent,
    replyToId: parent,
    rawContent: `comment ${id}`,
    renderedContent: `comment ${id}`,
    createdAt: new Date(id * 10000),
    isSpam: false,
    path: "/",
    visitorName: "Visitor",
  };
}
function makeMockComments(
  mockCommentStructure: { id: number; children?: number[] }[],
) {
  const comments: (typeof comment.$inferInsert)[] = [];
  for (const item of mockCommentStructure) {
    comments.push(makeCommentFromId(item.id, null));
    if (item.children) {
      for (const childId of item.children) {
        comments.push(makeCommentFromId(childId, item.id));
      }
    }
  }
  return comments;
}

describe("cursor style pagination", () => {
  beforeEach(async () => {
    client = createClient({ url: ":memory:" });
    db = drizzle({ client, schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    vi.setSystemTime(new Date("2000-01-01T00:00:00.000Z"));

    // await db.insert(user).values(mockUser);
    await db.insert(comment).values(makeMockComments(mockCommentStructure));
    // await db.insert(reaction).values(reactionFixtures);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  const mockCommentStructure = [
    {
      id: 1,
      children: [11, 12, 13, 14],
    },
    {
      id: 2,
      children: [21, 22, 23],
    },
    {
      id: 3,
    },
    {
      id: 4,
      children: [41],
    },
  ];

  it("should return first page correctly", async () => {
    const result = await getComments(
      { path: "/", limit: 2, sortBy: "created_desc" },
      { db, user: null },
    );
    expect(
      JSON.parse(JSON.stringify(result, commentDataReplacer)),
    ).toMatchSnapshot();
  });
  it("should return second page correctly", async () => {
    const result = await getComments(
      { path: "/", limit: 3, cursor: 3, sortBy: "created_desc" },
      { db, user: null },
    );
    expect(
      JSON.parse(JSON.stringify(result, commentDataReplacer)),
    ).toMatchSnapshot();
  });
  it("with wrong cursor", async () => {
    const result = await getComments(
      { path: "/", limit: 3, cursor: 999, sortBy: "created_desc" },
      { db, user: null },
    );
    expect(result.comments.length).toBe(0);
  });
  it("should work with created_asc", async () => {
    const result = await getComments(
      { path: "/", limit: 3, sortBy: "created_asc" },
      { db, user: null },
    );
    expect(
      JSON.parse(JSON.stringify(result, commentDataReplacer)),
    ).toMatchSnapshot();
  });
  it("should return empty when no comments", async () => {
    const result = await getComments(
      { path: "/not-exist", limit: 3, sortBy: "created_asc" },
      { db, user: null },
    );
    expect(result.comments.length).toBe(0);
    expect(result.total).toBe(0);
    expect(result.cursor).toBe(0);
    expect(result.hasMore).toBe(false);
  });
});

describe("get more children with cursor", () => {
  const mockCommentStructure = [
    {
      id: 1,
      children: [11, 12, 13, 14, 15, 16, 17],
    },
  ];

  beforeEach(async () => {
    client = createClient({ url: ":memory:" });
    db = drizzle({ client, schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    vi.setSystemTime(new Date("2000-01-01T00:00:00.000Z"));

    // await db.insert(user).values(mockUser);
    await db.insert(comment).values(makeMockComments(mockCommentStructure));
    // await db.insert(reaction).values(reactionFixtures);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return first page correctly", async () => {
    const result = await getCommentsChildren(
      { path: "/", limit: 2, sortBy: "created_desc", rootId: 1 },
      { db, user: null },
    );
    expect(
      JSON.parse(JSON.stringify(result, commentDataReplacer)),
    ).toMatchSnapshot();
  });
  it("should return second page correctly", async () => {
    const result = await getCommentsChildren(
      { path: "/", limit: 2, sortBy: "created_desc", rootId: 1, cursor: 16 },
      { db, user: null },
    );
    expect(
      JSON.parse(JSON.stringify(result, commentDataReplacer)),
    ).toMatchSnapshot();
  });
  it("no more", async () => {
    const result = await getCommentsChildren(
      {
        path: "/",
        limit: 2,
        sortBy: "created_desc",
        rootId: 1,
        cursor: 12,
      },
      { db, user: null },
    );
    expect(result.hasMore).toBe(false);
  });
  it("with wrong cursor", async () => {
    const result = await getCommentsChildren(
      {
        path: "/",
        limit: 2,
        sortBy: "created_desc",
        rootId: 1,
        cursor: 999,
      },
      { db, user: null },
    );
    expect(result.hasMore).toBe(false);
    expect(result.data.length).toBe(0);
    expect(result.cursor).toBe(0);
  });
  it("should work with created_asc", async () => {
    const result = await getCommentsChildren(
      {
        path: "/",
        limit: 3,
        sortBy: "created_asc",
        rootId: 1,
      },
      { db, user: null },
    );
    expect(
      JSON.parse(JSON.stringify(result, commentDataReplacer)),
    ).toMatchSnapshot();
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function commentDataReplacer(key: string, value: any) {
  // Only apply special logic for objects
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if ("anonymousName" in value) {
      // Only keep "id"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return { id: value.id };
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return value;
}
