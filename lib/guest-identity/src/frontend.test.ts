import { describe, expect, it } from "vitest";
import { createGuestIdentityFrontend } from "./frontend.js";
import {
  GUEST_IDENTITY_HEADER,
  GUEST_IDENTITY_STATE_HEADER,
  GUEST_IDENTITY_STORAGE_KEY,
} from "./shared.js";

function createStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial) values.set(GUEST_IDENTITY_STORAGE_KEY, initial);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

function headers(state?: "present" | "absent", key?: string) {
  const result = new Headers();
  if (state) result.set(GUEST_IDENTITY_STATE_HEADER, state);
  if (key) result.set(GUEST_IDENTITY_HEADER, key);
  return result;
}

describe("Guest Identity frontend", () => {
  it("does not trust a persisted projection before server confirmation", () => {
    const identity = createGuestIdentityFrontend(createStorage("guest-1"));
    expect(identity.snapshot()).toEqual({
      status: "unconfirmed",
      projectedGuestKey: "guest-1",
    });
    expect(identity.owns({ type: "guest", key: "guest-1" })).toBe(false);
  });

  it("confirms both user and same-browser guest ownership", () => {
    const identity = createGuestIdentityFrontend(createStorage());
    expect(identity.synchronize(headers("present", "guest-1"))).toBe("present");
    expect(identity.owns({ type: "user", id: "user-1" }, "user-1")).toBe(true);
    expect(identity.owns({ type: "guest", key: "guest-1" }, "user-1")).toBe(
      true,
    );
  });

  it("clears stale state when the server confirms no guest cookie", () => {
    const storage = createStorage("stale");
    const identity = createGuestIdentityFrontend(storage);
    expect(identity.synchronize(headers("absent"))).toBe("absent");
    expect(identity.snapshot()).toEqual({
      status: "confirmed-absent",
      projectedGuestKey: null,
    });
    expect(storage.getItem(GUEST_IDENTITY_STORAGE_KEY)).toBeNull();
  });

  it("fails closed when present metadata omits the projection", () => {
    const identity = createGuestIdentityFrontend(createStorage("cached"));
    expect(identity.synchronize(headers("present"))).toBeNull();
    expect(identity.snapshot().status).toBe("unconfirmed");
    expect(identity.owns({ type: "guest", key: "cached" })).toBe(false);
  });
});
