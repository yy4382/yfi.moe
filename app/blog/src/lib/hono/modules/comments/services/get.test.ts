import { describe, it, beforeAll, expect, vi, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/libsql";
import { getComments } from "./get";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";

const db = drizzle(":memory:", { schema });

const { user, comment } = schema;
beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
  vi.setSystemTime(new Date("2000-01-01T00:00:00.000Z"));
  await db.insert(user).values({
    id: "1",
    name: "admin",
    email: "admin@example.com",
    role: "admin",
  });
  await db.insert(user).values({
    id: "2",
    name: "user",
    email: "user@example.com",
    role: "user",
  });
  await db.insert(comment).values({
    id: 1,
    rawContent: "comment 1",
    renderedContent: "comment 1",
    path: "/",
    isSpam: false,
    userId: "1",
    createdAt: new Date(10000),
  });
  await db.insert(comment).values({
    id: 2,
    rawContent: "comment 2",
    renderedContent: "comment 2",
    path: "/",
    isSpam: false,
    userId: "2",
    createdAt: new Date(20000),
  });
  await db.insert(comment).values({
    id: 3,
    rawContent: "comment 3",
    renderedContent: "comment 3",
    path: "/",
    isSpam: false,
    visitorName: "visitor 3",
    createdAt: new Date(30000),
  });
  await db.insert(comment).values({
    id: 4,
    rawContent: "comment 4",
    renderedContent: "comment 4",
    path: "/",
    isSpam: false,
    visitorName: "visitor 4",
    createdAt: new Date(40000),
  });
  await db.insert(comment).values({
    id: 1000,
    rawContent: "1 reply to 1",
    renderedContent: "1 reply to 1",
    path: "/",
    isSpam: false,
    parentId: 1,
    replyToId: 1,
    userId: "2",
    createdAt: new Date(15000),
  });
  await db.insert(comment).values({
    rawContent: "2 reply to 1",
    renderedContent: "2 reply to 1",
    path: "/",
    isSpam: false,
    parentId: 1,
    replyToId: 1,
    visitorName: "visitor 5",
    createdAt: new Date(50000),
  });
  await db.insert(comment).values({
    rawContent: "1 reply to 1 reply to 1",
    renderedContent: "1 reply to 1 reply to 1",
    path: "/",
    isSpam: false,
    parentId: 1,
    replyToId: 1000,
    userId: "2",
    createdAt: new Date(60000),
  });
});

afterAll(() => {
  vi.useRealTimers();
});

describe("admin get comments", () => {
  it("should return comments", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments, total } = await getComments(
      { path: "/", limit: 10, offset: 0, sortBy: "created_asc" },
      { db, user: admin },
    );
    expect(total).toBe(4);
    expect(comments.length).toBe(4);
    expect(comments.find((c) => c.id === 1)?.children?.length).toBe(3);
    expect(comments).toMatchSnapshot();
  });
  it("should return comments with limit and offset", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 1, offset: 1, sortBy: "created_asc" },
      { db, user: admin },
    );
    expect(comments.length).toBe(1);
    expect(comments[0].id).toBe(2);
  });
  it("should return comments with sortBy", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const { comments } = await getComments(
      { path: "/", limit: 2, offset: 2, sortBy: "created_desc" },
      { db, user: admin },
    );
    expect(comments.length).toBe(2);
    expect(comments[0].id).toBe(2);
    expect(comments[1].id).toBe(1);
  });
});
