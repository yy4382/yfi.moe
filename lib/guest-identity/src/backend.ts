import type { PublicOwner } from "./shared.js";

export type PersistenceOwner =
  | { type: "user"; id: string }
  | { type: "guest"; rawKey: string };

export type ViewerIdentityInput = {
  authenticatedUserId?: string;
  rawGuestCookie?: string;
  createGuestIfMissing?: boolean;
};

export type ViewerIdentityScope = {
  creationOwner: PersistenceOwner | undefined;
  ownedByViewer: readonly PersistenceOwner[];
  publicOwners: readonly PublicOwner[];
  response: {
    guestState: "present" | "absent";
    projectedGuestKey?: string;
    setRawGuestCookie?: string;
  };
};

export type GuestIdentityBackendDependencies = {
  createRawKey(): string;
  projectRawKey(rawKey: string): string;
};

export function createGuestIdentityBackend(
  dependencies: GuestIdentityBackendDependencies,
) {
  function toPublicOwner(
    owner: Extract<PersistenceOwner, { type: "user" }>,
  ): Extract<PublicOwner, { type: "user" }>;
  function toPublicOwner(
    owner: Extract<PersistenceOwner, { type: "guest" }>,
  ): Extract<PublicOwner, { type: "guest" }>;
  function toPublicOwner(owner: PersistenceOwner): PublicOwner;
  function toPublicOwner(owner: PersistenceOwner): PublicOwner {
    return owner.type === "user"
      ? owner
      : { type: "guest", key: dependencies.projectRawKey(owner.rawKey) };
  }

  return {
    toPublicOwner,

    resolve(input: ViewerIdentityInput): ViewerIdentityScope {
      let rawGuestKey = input.rawGuestCookie;
      if (
        !input.authenticatedUserId &&
        !rawGuestKey &&
        input.createGuestIfMissing
      ) {
        rawGuestKey = dependencies.createRawKey();
      }

      const userOwner = input.authenticatedUserId
        ? ({ type: "user", id: input.authenticatedUserId } as const)
        : undefined;
      const guestOwner = rawGuestKey
        ? ({ type: "guest", rawKey: rawGuestKey } as const)
        : undefined;
      const projectedGuestKey = rawGuestKey
        ? dependencies.projectRawKey(rawGuestKey)
        : undefined;

      const ownedByViewer: PersistenceOwner[] = [];
      const publicOwners: PublicOwner[] = [];
      if (userOwner) {
        ownedByViewer.push(userOwner);
        publicOwners.push(toPublicOwner(userOwner));
      }
      if (guestOwner && projectedGuestKey) {
        ownedByViewer.push(guestOwner);
        publicOwners.push(toPublicOwner(guestOwner));
      }

      return {
        creationOwner: userOwner ?? guestOwner,
        ownedByViewer,
        publicOwners,
        response: {
          guestState: guestOwner ? "present" : "absent",
          ...(projectedGuestKey ? { projectedGuestKey } : {}),
          ...(!input.rawGuestCookie && guestOwner
            ? { setRawGuestCookie: guestOwner.rawKey }
            : {}),
        },
      };
    },
  } as const;
}
