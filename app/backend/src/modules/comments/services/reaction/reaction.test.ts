import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "@/db/schema.js";
import type { DbClient } from "@/db/db-plugin.js";
import { addReaction } from "./add.js";
import { removeReaction } from "./remove.js";
import type { ReactionActor } from "./types.js";

let db: DbClient;

const { user, comment, reaction } = schema;
const baseUser: typeof user.$inferInsert = {
  id: "user-1",
  email: "user1@example.com",
  name: "User One",
  role: "user",
};

const secondUser: typeof user.$inferInsert = {
  id: "user-2",
  email: "user2@example.com",
  name: "User Two",
  role: "user",
};

beforeEach(async () => {
  const client = createClient({ url: ":memory:" });
  db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: "./drizzle" });

  await db.insert(user).values([baseUser, secondUser]);
  await db.insert(comment).values([
    {
      id: 1,
      path: "/",
      rawContent: "hi",
      renderedContent: "hi",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      userId: baseUser.id,
      isSpam: false,
    },
  ]);
});

const anonymousActor: ReactionActor = {
  type: "anonymous",
  key: "anon-key",
};

const userActor: ReactionActor = {
  type: "user",
  id: baseUser.id,
  role: "user",
};

describe("addReaction", () => {
  it("adds a reaction for authenticated users and reuses existing entry", async () => {
    const first = await addReaction(1, "👍🏿", userActor, { db });
    expect(first.result).toBe("success");
    if (first.result !== "success") {
      throw new Error("unexpected result");
    }
    expect(first.data.emojiKey).toBe("👍");
    expect(first.data.emojiRaw).toBe("👍🏿");
    expect(first.data.user).toEqual(
      expect.objectContaining({
        type: "user",
        id: baseUser.id,
        name: baseUser.name,
      }),
    );

    const again = await addReaction(1, "👍", userActor, { db });
    expect(again.result).toBe("success");
    if (again.result !== "success") {
      throw new Error("unexpected result");
    }
    expect(again.data.id).toBe(first.data.id);

    const rows = await db.select().from(reaction);
    expect(rows.length).toBe(1);
  });

  it("adds a reaction for anonymous users", async () => {
    const result = await addReaction(1, "👏🏻", anonymousActor, { db });
    expect(result.result).toBe("success");
    if (result.result !== "success") {
      throw new Error("unexpected result");
    }
    expect(result.data.user).toEqual({
      type: "anonymous",
      key: anonymousActor.key,
    });

    const rows = await db.select().from(reaction);
    expect(rows.length).toBe(1);
    expect(rows[0]).toMatchObject({
      actorAnonKey: anonymousActor.key,
      actorId: null,
    });
  });

  it("returns not_found when comment does not exist", async () => {
    const result = await addReaction(999, "👍", userActor, { db });
    expect(result.result).toBe("not_found");
  });
});

describe("removeReaction", () => {
  it("removes user reactions", async () => {
    await addReaction(1, "🔥", userActor, { db });

    const result = await removeReaction(1, "🔥", userActor, { db });
    expect(result.result).toBe("success");

    const rows = await db.select().from(reaction);
    expect(rows.length).toBe(0);
  });

  it("removes anonymous reactions and is idempotent", async () => {
    await addReaction(1, "🎉", anonymousActor, { db });
    const first = await removeReaction(1, "🎉", anonymousActor, { db });
    expect(first.result).toBe("success");

    const second = await removeReaction(1, "🎉", anonymousActor, { db });
    expect(second.result).toBe("success");
  });

  it("returns not_found when comment does not exist", async () => {
    const result = await removeReaction(999, "🔥", userActor, { db });
    expect(result.result).toBe("not_found");
  });
});
