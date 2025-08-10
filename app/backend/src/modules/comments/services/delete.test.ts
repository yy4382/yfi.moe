import { describe, it, expect, vi, afterAll, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/libsql";
import { deleteComment } from "./delete.js";
import * as schema from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient, type Client } from "@libsql/client";
import type { DbClient } from "@/db/db-plugin.js";

let client: Client;
let db: DbClient;

const { user, comment } = schema;

beforeEach(async () => {
  client = createClient({ url: ":memory:" });
  db = drizzle({ client, schema });

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
    rawContent: "1 reply to 1",
    renderedContent: "1 reply to 1",
    path: "/",
    isSpam: false,
    parentId: 1,
    replyToId: 1,
    userId: "2",
    createdAt: new Date(15000),
  });
});

afterAll(() => {
  vi.useRealTimers();
});

describe("admin get comments", () => {
  it("should return comments", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const res = await deleteComment(2, { db, user: admin });
    expect(res.result).toBe("success");
    const comments = await db.select().from(comment).where(eq(comment.id, 2));
    expect(comments[0].deletedAt).not.toBeNull();
  });
  it("should also delete reply comments", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const res = await deleteComment(1, { db, user: admin });
    expect(res.result).toBe("success");
    if (res.result !== "success") {
      throw new Error("should not happen");
    }
    expect(res.deletedIds).toEqual([1, 4]);
    const comments = await db.select().from(comment).where(eq(comment.id, 1));
    expect(comments[0].deletedAt).not.toBeNull();
    const replies = await db
      .select()
      .from(comment)
      .where(eq(comment.parentId, 1));
    expect(replies[0].deletedAt).not.toBeNull();
  });
  it("should give error if not found", async () => {
    const admin = (await db.select().from(user).where(eq(user.id, "1")))[0];
    const res = await deleteComment(10000, { db, user: admin });
    expect(res.result).toBe("not_found");
  });
});

describe("user get comments", () => {
  it("should give error if not found", async () => {
    const normalUser = (
      await db.select().from(user).where(eq(user.id, "2"))
    )[0];
    const res = await deleteComment(2, { db, user: normalUser });
    expect(res.result).toBe("success");
    const comments = await db.select().from(comment).where(eq(comment.id, 2));
    expect(comments[0].deletedAt).not.toBeNull();
  });
  it("should give error if not self's comment", async () => {
    const normalUser = (
      await db.select().from(user).where(eq(user.id, "2"))
    )[0];
    const res = await deleteComment(3, { db, user: normalUser });
    expect(res.result).toBe("forbidden");
  });
});
