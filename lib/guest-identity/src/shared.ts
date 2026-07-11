export const GUEST_IDENTITY_HEADER = "x-guest-identity";
export const GUEST_IDENTITY_STATE_HEADER = "x-guest-identity-state";
export const GUEST_IDENTITY_STORAGE_KEY = "guestIdentityProjection";

export type GuestIdentityState = "present" | "absent";

export type PublicOwner =
  | { type: "user"; id: string }
  | { type: "guest"; key: string };
