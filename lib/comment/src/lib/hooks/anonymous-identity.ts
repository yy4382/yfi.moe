import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";

export const ANONYMOUS_IDENTITY_STORAGE_KEY = "commentAnonymousKey";

const anonymousIdentityAtom = atomWithStorage<string | null>(
  ANONYMOUS_IDENTITY_STORAGE_KEY,
  null,
);

export function useAnonymousIdentity() {
  const [anonymousKey, setAnonymousKey] = useAtom(anonymousIdentityAtom);

  const syncFromHeader = useCallback(
    (key?: string | null) => {
      if (!key) {
        return;
      }
      setAnonymousKey((prev) => (prev === key ? prev : key));
    },
    [setAnonymousKey],
  );

  return {
    anonymousKey,
    setAnonymousKey,
    syncFromHeader,
  } as const;
}
