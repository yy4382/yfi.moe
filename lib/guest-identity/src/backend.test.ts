import { describe, expect, it } from "vitest";
import { createGuestIdentityBackend } from "./backend.js";

const backend = createGuestIdentityBackend({
  createRawKey: () => "generated-raw-key",
  projectRawKey: (rawKey) => `public(${rawKey})`,
});

describe("Guest Identity backend", () => {
  it("uses the configured projector for every public guest owner", () => {
    expect(backend.toPublicOwner({ type: "guest", rawKey: "guest-1" })).toEqual(
      { type: "guest", key: "public(guest-1)" },
    );
  });

  it("creates as the signed-in user while retaining the browser guest owner", () => {
    expect(
      backend.resolve({
        authenticatedUserId: "user-1",
        rawGuestCookie: "guest-1",
      }),
    ).toEqual({
      creationOwner: { type: "user", id: "user-1" },
      ownedByViewer: [
        { type: "user", id: "user-1" },
        { type: "guest", rawKey: "guest-1" },
      ],
      publicOwners: [
        { type: "user", id: "user-1" },
        { type: "guest", key: "public(guest-1)" },
      ],
      response: {
        guestState: "present",
        projectedGuestKey: "public(guest-1)",
      },
    });
  });

  it("creates a guest only when a signed-out create requests one", () => {
    expect(backend.resolve({ createGuestIfMissing: true })).toEqual({
      creationOwner: { type: "guest", rawKey: "generated-raw-key" },
      ownedByViewer: [{ type: "guest", rawKey: "generated-raw-key" }],
      publicOwners: [{ type: "guest", key: "public(generated-raw-key)" }],
      response: {
        guestState: "present",
        projectedGuestKey: "public(generated-raw-key)",
        setRawGuestCookie: "generated-raw-key",
      },
    });
    expect(backend.resolve({})).toEqual({
      creationOwner: undefined,
      ownedByViewer: [],
      publicOwners: [],
      response: { guestState: "absent" },
    });
  });

  it("does not mint a guest identity for a signed-in create", () => {
    expect(
      backend.resolve({
        authenticatedUserId: "user-1",
        createGuestIfMissing: true,
      }),
    ).toEqual({
      creationOwner: { type: "user", id: "user-1" },
      ownedByViewer: [{ type: "user", id: "user-1" }],
      publicOwners: [{ type: "user", id: "user-1" }],
      response: { guestState: "absent" },
    });
  });
});
