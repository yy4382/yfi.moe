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
import { getComments } from "./get.js";
import * as schema from "@/db/schema.js";
import { eq } from "drizzle-orm";
import type { DbClient } from "@/db/db-plugin.js";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";

let client: Client;
let db: DbClient;

const { user, comment } = schema;

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

beforeEach(async () => {
  client = createClient({ url: ":memory:" });
  db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  vi.setSystemTime(new Date("2000-01-01T00:00:00.000Z"));

  await db.insert(user).values(mockUser);
  await db.insert(comment).values(mockComment);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("admin get comments", () => {
  it("should return comments", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments, total } = await getComments(
      { path: "/", limit: 1000, offset: 0, sortBy: "created_asc" },
      { db, user: admin },
    );
    expect(total).toBe(17);

    expect(
      comments.find((c) => c.children.length !== 0)?.children?.length,
      "parent comment has proper amount of children",
    ).toBe(3);
    expect(
      comments.at(0),
      "admin comment should include all info",
    ).toMatchSnapshot();
  });
  it("should include spam comments", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 1000, offset: 0, sortBy: "created_asc" },
      { db, user: admin },
    );
    expect(comments.find((c) => c.isSpam)).toBeDefined();
  });

  it("should return comments with limit and offset", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 5, offset: 5, sortBy: "created_asc" },
      { db, user: admin },
    );
    expect(comments.length).toBe(5);
    expect(comments[0].id).toBe(6);
  });
  it("should return comments with sortBy", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 2, offset: 2, sortBy: "created_desc" },
      { db, user: admin },
    );
    expect(comments.length).toBe(2);
    expect(comments[0].id).toBeGreaterThan(comments[1].id);
  });
});

describe("non-admin get comments", () => {
  it("should return comments", async () => {
    const user1 = (await db.select().from(user).where(eq(user.id, "2")))[0];
    const { comments, total } = await getComments(
      { path: "/", limit: 1000, offset: 0, sortBy: "created_asc" },
      { db, user: user1 },
    );
    expect(total).toBe(9);

    expect(
      comments.find((c) => c.children.length !== 0)?.children?.length,
      "parent comment has proper amount of children",
    ).toBe(3);
    expect(
      comments.at(0),
      "non-admin comment should include partial info",
    ).toMatchSnapshot();
  });
  it("should not include spam comments", async () => {
    const user1 = (await db.select().from(user).where(eq(user.id, "2")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 1000, offset: 0, sortBy: "created_asc" },
      { db, user: user1 },
    );
    expect(comments.find((c) => c.isSpam)).toBeUndefined();
  });
});
