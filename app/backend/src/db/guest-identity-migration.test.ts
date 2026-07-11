import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as schema from "./schema.js";

let client: Client;

beforeEach(() => {
  client = createClient({ url: ":memory:" });
});

afterEach(() => {
  client.close();
});

describe("guest comment ownership migration", () => {
  it("preserves representative pre-migration data without claiming it", async () => {
    await applyGeneratedMigration("0000_luxuriant_northstar.sql");
    await applyGeneratedMigration("0001_spicy_lady_bullseye.sql");
    await seedPreMigrationData();

    const commentsBefore = await client.execute(
      "SELECT * FROM comment ORDER BY id",
    );
    const reactionsBefore = await client.execute(
      "SELECT * FROM reaction ORDER BY id",
    );

    await applyGeneratedMigration("0002_motionless_shaman.sql");

    const columns = await client.execute("PRAGMA table_info(comment)");
    expect(columns.rows.map((row) => row.name)).toContain("guest_owner_key");

    const indexes = await client.execute("PRAGMA index_list(comment)");
    expect(indexes.rows.map((row) => row.name)).toContain(
      "idx_comments_guest_owner",
    );

    const commentsAfter = await client.execute(
      "SELECT * FROM comment ORDER BY id",
    );
    expect(commentsAfter.rows).toHaveLength(commentsBefore.rows.length);
    expect(
      commentsAfter.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        visitorName: row.visitor_name,
        parentId: row.parent_id,
        replyToId: row.reply_to_id,
        deletedAt: row.deleted_at,
        guestOwnerKey: row.guest_owner_key,
      })),
    ).toEqual([
      {
        id: 1,
        userId: "user-1",
        visitorName: null,
        parentId: null,
        replyToId: null,
        deletedAt: null,
        guestOwnerKey: null,
      },
      {
        id: 2,
        userId: null,
        visitorName: "Legacy visitor",
        parentId: null,
        replyToId: null,
        deletedAt: null,
        guestOwnerKey: null,
      },
      {
        id: 3,
        userId: null,
        visitorName: "Legacy reply",
        parentId: 2,
        replyToId: 2,
        deletedAt: null,
        guestOwnerKey: null,
      },
      {
        id: 4,
        userId: null,
        visitorName: "Deleted visitor",
        parentId: null,
        replyToId: null,
        deletedAt: 40_000,
        guestOwnerKey: null,
      },
    ]);

    const reactionsAfter = await client.execute(
      "SELECT * FROM reaction ORDER BY id",
    );
    expect(reactionsAfter.rows).toEqual(reactionsBefore.rows);
    expect(reactionsAfter.rows).toHaveLength(2);
    expect(reactionsAfter.rows.map((row) => row.actor_id)).toEqual([
      "user-1",
      null,
    ]);
    expect(reactionsAfter.rows.map((row) => row.actor_anon_key)).toEqual([
      null,
      "legacy-guest-key",
    ]);

    await client.execute({
      sql: `INSERT INTO comment (
        id, raw_content, rendered_content, path, created_at, updated_at,
        visitor_name, visitor_email, guest_owner_key, is_spam
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        5,
        "new owned guest comment",
        "new owned guest comment",
        "/migration",
        50_000,
        50_000,
        "New guest",
        "new@example.com",
        "new-guest-owner",
        0,
      ],
    });
    const newComment = await client.execute(
      "SELECT guest_owner_key FROM comment WHERE id = 5",
    );
    expect(newComment.rows[0]?.guest_owner_key).toBe("new-guest-owner");

    const commentsBeforeRebuild = await selectCommentMigrationProjection();
    await applyRemainingMigrationsWithDrizzle("0002_motionless_shaman");
    expect(await selectCommentMigrationProjection()).toEqual(
      commentsBeforeRebuild,
    );
    expect(
      (await client.execute("SELECT * FROM reaction ORDER BY id")).rows,
    ).toEqual(reactionsBefore.rows);
    await expect(
      client.execute(
        "UPDATE comment SET guest_owner_key = 'invalid-dual-owner' WHERE id = 1",
      ),
    ).rejects.toThrow();
  });
});

async function applyGeneratedMigration(fileName: string) {
  const sql = await readFile(
    new URL(`../../drizzle/${fileName}`, import.meta.url),
    "utf8",
  );
  for (const statement of sql.split("--> statement-breakpoint")) {
    const trimmed = statement.trim();
    if (trimmed) await client.execute(trimmed);
  }
}

async function applyRemainingMigrationsWithDrizzle(lastAppliedTag: string) {
  const journal = JSON.parse(
    await readFile(
      new URL("../../drizzle/meta/_journal.json", import.meta.url),
      "utf8",
    ),
  ) as { entries: Array<{ tag: string; when: number }> };
  const lastApplied = journal.entries.find(
    (entry) => entry.tag === lastAppliedTag,
  );
  if (!lastApplied) throw new Error(`missing migration ${lastAppliedTag}`);

  await client.execute(`CREATE TABLE __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL,
    created_at NUMERIC
  )`);
  await client.execute({
    sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
    args: ["pre-existing-migration", lastApplied.when],
  });
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
}

async function selectCommentMigrationProjection() {
  return (
    await client.execute(`SELECT
      id, raw_content, rendered_content, path, parent_id, reply_to_id,
      created_at, updated_at, deleted_at, user_id, visitor_name,
      visitor_email, guest_owner_key, is_spam
    FROM comment ORDER BY id`)
  ).rows;
}

async function seedPreMigrationData() {
  await client.execute({
    sql: `INSERT INTO user (
      id, name, email, email_verified, created_at, updated_at, role
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "user-1",
      "Existing user",
      "user@example.com",
      1,
      1_000,
      1_000,
      "user",
    ],
  });

  const commentRows = [
    [1, "user comment", "user-1", null, null, null, null],
    [2, "visitor comment", null, "Legacy visitor", null, null, null],
    [3, "visitor reply", null, "Legacy reply", 2, 2, null],
    [4, "deleted visitor", null, "Deleted visitor", null, null, 40_000],
  ] as const;
  for (const [
    id,
    content,
    userId,
    visitorName,
    parentId,
    replyToId,
    deletedAt,
  ] of commentRows) {
    await client.execute({
      sql: `INSERT INTO comment (
        id, raw_content, rendered_content, path, parent_id, reply_to_id,
        created_at, updated_at, deleted_at, user_id, visitor_name,
        visitor_email, is_spam
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        content,
        content,
        "/migration",
        parentId,
        replyToId,
        id * 10_000,
        id * 10_000,
        deletedAt,
        userId,
        visitorName,
        visitorName ? `visitor-${id}@example.com` : null,
        0,
      ],
    });
  }

  for (const [actorId, actorGuestKey] of [
    ["user-1", null],
    [null, "legacy-guest-key"],
  ] as const) {
    await client.execute({
      sql: `INSERT INTO reaction (
        comment_id, actor_id, actor_anon_key, emoji_raw, emoji_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [1, actorId, actorGuestKey, "👍", "👍", 60_000],
    });
  }
}
