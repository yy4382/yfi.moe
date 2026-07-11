import { describe, expect, it } from "vitest";
import {
  GUEST_IDENTITY_HEADER,
  GUEST_IDENTITY_STATE_HEADER,
} from "@repo/guest-identity";
import { factory, type Variables } from "@/factory.js";
import {
  GUEST_IDENTITY_COOKIE,
  guestIdentityPlugin,
} from "./guest-identity-plugin.js";

function createApp(auth?: Variables["auth"]) {
  return factory
    .createApp()
    .use(async (c, next) => {
      c.set("auth", auth);
      await next();
    })
    .use(guestIdentityPlugin())
    .get("/scope", (c) => c.json(c.get("guestIdentity").resolve()))
    .post("/create", (c) => {
      const identity = c.get("guestIdentity");
      const scope = identity.resolve({ createGuestIfMissing: true });
      identity.commit(scope);
      return c.json(scope);
    })
    .post("/uncommitted-create", (c) =>
      c.json(c.get("guestIdentity").resolve({ createGuestIfMissing: true })),
    )
    .post("/repeat-create", (c) => {
      const identity = c.get("guestIdentity");
      const first = identity.resolve({ createGuestIfMissing: true });
      const second = identity.resolve({ createGuestIfMissing: true });
      identity.commit(second);
      return c.json({ first, second });
    });
}

describe("Guest Identity Hono adapter", () => {
  it("exposes a composite scope and explicit identity headers", async () => {
    const auth = {
      user: { id: "user-1", name: "User", email: "user@example.com" },
      session: {},
    } as Variables["auth"];
    const response = await createApp(auth).request("/scope", {
      headers: { Cookie: `${GUEST_IDENTITY_COOKIE}=guest-1` },
    });
    const scope = (await response.json()) as {
      creationOwner: { type: string; id: string };
      ownedByViewer: Array<{ type: string }>;
      publicOwners: Array<{ type: string; key?: string }>;
    };

    expect(scope.creationOwner).toEqual({ type: "user", id: "user-1" });
    expect(scope.ownedByViewer.map((owner) => owner.type)).toEqual([
      "user",
      "guest",
    ]);
    expect(response.headers.get(GUEST_IDENTITY_STATE_HEADER)).toBe("present");
    expect(response.headers.get(GUEST_IDENTITY_HEADER)).toBe(
      scope.publicOwners.find((owner) => owner.type === "guest")?.key,
    );
  });

  it("does not mint a cookie until a successful feature commits the scope", async () => {
    const response = await createApp().request("/uncommitted-create", {
      method: "POST",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get(GUEST_IDENTITY_STATE_HEADER)).toBe("absent");
  });

  it("reuses one pending credential across repeated request resolution", async () => {
    const response = await createApp().request("/repeat-create", {
      method: "POST",
    });
    const scopes = (await response.json()) as {
      first: { creationOwner: { type: string; rawKey: string } };
      second: { creationOwner: { type: string; rawKey: string } };
    };
    expect(scopes.first.creationOwner).toEqual(scopes.second.creationOwner);
    expect(response.headers.get("set-cookie")).toContain(
      scopes.first.creationOwner.rawKey,
    );
  });

  it("creates the HTTP-only guest cookie only for a signed-out create", async () => {
    const response = await createApp().request("/create", { method: "POST" });
    expect(response.headers.get("set-cookie")).toContain(
      `${GUEST_IDENTITY_COOKIE}=`,
    );
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get(GUEST_IDENTITY_STATE_HEADER)).toBe("present");
  });

  it("explicitly confirms absence without minting on reads", async () => {
    const response = await createApp().request("/scope");
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get(GUEST_IDENTITY_STATE_HEADER)).toBe("absent");
    expect(response.headers.get(GUEST_IDENTITY_HEADER)).toBeNull();
  });
});
