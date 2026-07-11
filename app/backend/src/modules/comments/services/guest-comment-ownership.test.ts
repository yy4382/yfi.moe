import { createClient, type Client } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PersistenceOwner } from "@repo/guest-identity/backend";
import type { DbClient } from "@/db/db-plugin.js";
import * as schema from "@/db/schema.js";
import { addComment } from "./add/add.js";
import { deleteComment } from "./delete.js";
import { getComments } from "./get.js";
import { isCommentOwnedByViewer } from "./ownership.js";
import { updateComment } from "./update.js";

let client: Client;
let db: DbClient;
const { comment, user } = schema;

vi.mock(import("@/env.js"), () => ({
  env: { FRONTEND_URL: "http://localhost:3000" } as never,
}));

const ownerKey = "guest-owner-key";
const guestOwner = { type: "guest", rawKey: ownerKey } as const;
const otherGuest = { type: "guest", rawKey: "other-key" } as const;

beforeEach(async () => {
  client = createClient({ url: ":memory:" });
  db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await db.insert(user).values({
    id: "signed-in-user",
    name: "Signed in user",
    email: "signed-in@example.com",
    role: "user",
  });
  await db.insert(user).values({
    id: "admin-user",
    name: "Admin user",
    email: "admin@example.com",
    role: "admin",
  });
});

describe("guest comment ownership", () => {
  it("never lets a guest key override an existing user owner", () => {
    expect(
      isCommentOwnedByViewer(
        { userId: "user-owner", guestOwnerKey: ownerKey },
        [guestOwner],
      ),
    ).toBe(false);
  });

  it("rejects a guest create when no trusted owner scope was supplied", async () => {
    const result = await addComment(
      {
        path: "/guest-story",
        content: "unowned comment",
        visitorName: "Guest",
        visitorEmail: "guest@example.com",
      },
      { db, user: null, notificationService: { email: null } },
    );

    expect(result).toMatchObject({
      result: "bad_req",
      data: { message: "unable to resolve guest owner" },
    });
    expect(await db.select().from(comment)).toHaveLength(0);
  });

  it("persists a guest owner and preserves it after sign-in", async () => {
    const added = await addComment(
      {
        path: "/guest-story",
        content: "guest comment",
        visitorName: "Guest",
        visitorEmail: "guest@example.com",
      },
      {
        db,
        user: null,
        guestOwnerKey: ownerKey,
        notificationService: { email: null },
      },
    );

    expect(added.result).toBe("success");
    if (added.result !== "success") throw new Error("comment was not added");
    expect(added.data.data.ownedByViewer).toBe(true);

    const stored = await db
      .select()
      .from(comment)
      .where(eq(comment.id, added.data.data.id));
    expect(stored[0]?.guestOwnerKey).toBe(ownerKey);

    const sameGuest = await listFor([guestOwner]);
    const otherBrowser = await listFor([otherGuest]);
    expect(sameGuest[0]?.data.ownedByViewer).toBe(true);
    expect(otherBrowser[0]?.data.ownedByViewer).toBe(false);

    const signedInUser = (
      await db.select().from(user).where(eq(user.id, "signed-in-user"))
    )[0];
    const signedInOwners: PersistenceOwner[] = [
      { type: "user", id: signedInUser.id },
      guestOwner,
    ];
    const signedInView = await getComments(
      { path: "/guest-story", limit: 10, sortBy: "created_desc" },
      { db, user: signedInUser, ownedByViewer: signedInOwners },
    );
    expect(signedInView.comments[0]?.data.ownedByViewer).toBe(true);

    const updated = await updateComment(
      added.data.data.id,
      { rawContent: "edited after sign-in" },
      { db, user: signedInUser, ownedByViewer: signedInOwners },
    );
    expect(updated.code).toBe(200);
    if (updated.code === 200) {
      expect(updated.data.data.ownedByViewer).toBe(true);
      expect(updated.data.data.rawContent).toBe("edited after sign-in");
    }

    expect(
      await deleteComment(added.data.data.id, {
        db,
        user: null,
        ownedByViewer: [otherGuest],
      }),
    ).toMatchObject({ result: "forbidden" });
    expect(
      await deleteComment(added.data.data.id, {
        db,
        user: signedInUser,
        ownedByViewer: signedInOwners,
      }),
    ).toMatchObject({ result: "success" });
  });

  it("does not let a current guest claim a historical ownerless comment", async () => {
    const inserted = await db
      .insert(comment)
      .values({
        path: "/guest-story",
        rawContent: "legacy guest comment",
        renderedContent: "legacy guest comment",
        visitorName: "Legacy guest",
        visitorEmail: "legacy@example.com",
        isSpam: false,
        guestOwnerKey: null,
      })
      .returning();
    const id = inserted[0].id;

    const listed = await listFor([guestOwner]);
    expect(listed[0]?.data.ownedByViewer).toBe(false);
    expect(
      await updateComment(
        id,
        { rawContent: "attempted takeover" },
        { db, user: null, ownedByViewer: [guestOwner] },
      ),
    ).toMatchObject({ code: 403 });
    expect(
      await deleteComment(id, {
        db,
        user: null,
        ownedByViewer: [guestOwner],
      }),
    ).toMatchObject({ result: "forbidden" });

    const admin = (
      await db.select().from(user).where(eq(user.id, "admin-user"))
    )[0];
    const moderated = await updateComment(
      id,
      { rawContent: "moderated legacy comment" },
      { db, user: admin },
    );
    expect(moderated.code).toBe(200);
    if (moderated.code === 200) {
      expect(moderated.data.data.displayName).toBe("Legacy guest");
      expect(moderated.data.data.ownedByViewer).toBe(false);
    }
    expect(await deleteComment(id, { db, user: admin })).toMatchObject({
      result: "success",
    });
  });
});

async function listFor(ownedByViewer: readonly PersistenceOwner[]) {
  const result = await getComments(
    { path: "/guest-story", limit: 10, sortBy: "created_desc" },
    { db, user: null, ownedByViewer },
  );
  return result.comments;
}
