import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { PublicOwner } from "@repo/guest-identity";
import {
  createGuestIdentityFrontend,
  type GuestIdentityFrontendStatus,
} from "@repo/guest-identity/frontend";

type Snapshot = {
  status: GuestIdentityFrontendStatus;
  projectedGuestKey: string | null;
};

const snapshotAtom = atom<Snapshot>({
  status: "unconfirmed",
  projectedGuestKey: null,
});

let browserIdentity: ReturnType<typeof createGuestIdentityFrontend> | undefined;

function getBrowserIdentity() {
  if (browserIdentity) return browserIdentity;
  browserIdentity = createGuestIdentityFrontend(localStorage);
  return browserIdentity;
}

export function useGuestIdentity() {
  const [snapshot, setSnapshot] = useAtom(snapshotAtom);

  const synchronize = useCallback(
    (headers: Pick<Headers, "get">) => {
      const identity = getBrowserIdentity();
      const result = identity.synchronize(headers);
      setSnapshot({ ...identity.snapshot() });
      return result;
    },
    [setSnapshot],
  );

  const owns = useCallback(
    (owner: PublicOwner, authenticatedUserId?: string) => {
      void snapshot;
      return getBrowserIdentity().owns(owner, authenticatedUserId);
    },
    [snapshot],
  );

  return { snapshot, synchronize, owns } as const;
}
