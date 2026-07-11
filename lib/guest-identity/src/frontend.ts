import {
  GUEST_IDENTITY_HEADER,
  GUEST_IDENTITY_STATE_HEADER,
  GUEST_IDENTITY_STORAGE_KEY,
  type GuestIdentityState,
  type PublicOwner,
} from "./shared.js";

export type GuestProjectionStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type GuestIdentityFrontendStatus =
  | "unconfirmed"
  | "confirmed-present"
  | "confirmed-absent";

export function createGuestIdentityFrontend(storage: GuestProjectionStorage) {
  let status: GuestIdentityFrontendStatus = "unconfirmed";
  let projectedGuestKey = storage.getItem(GUEST_IDENTITY_STORAGE_KEY);

  return {
    synchronize(headers: Pick<Headers, "get">): GuestIdentityState | null {
      const state = headers.get(GUEST_IDENTITY_STATE_HEADER);
      if (state === "absent") {
        status = "confirmed-absent";
        projectedGuestKey = null;
        storage.removeItem(GUEST_IDENTITY_STORAGE_KEY);
        return state;
      }

      if (state === "present") {
        const nextKey = headers.get(GUEST_IDENTITY_HEADER);
        if (nextKey) {
          status = "confirmed-present";
          projectedGuestKey = nextKey;
          storage.setItem(GUEST_IDENTITY_STORAGE_KEY, nextKey);
          return state;
        }
      }

      status = "unconfirmed";
      return null;
    },

    owns(owner: PublicOwner, authenticatedUserId?: string): boolean {
      if (owner.type === "user") return owner.id === authenticatedUserId;
      return status === "confirmed-present" && owner.key === projectedGuestKey;
    },

    snapshot() {
      return { status, projectedGuestKey } as const;
    },
  } as const;
}
