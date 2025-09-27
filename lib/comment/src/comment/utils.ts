import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { AuthClientRefContext, type AuthClient } from "./context";

export function sessionOptions(authClient: AuthClient) {
  return queryOptions({
    queryKey: ["session"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await authClient.getSession();
      if (res.error) {
        throw new Error(res.error.message);
      }
      console.log("fetched session", res);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "yfi-session",
          JSON.stringify({
            data: res.data,
            time: Date.now(),
          }),
        );
      }
      return res.data;
    },
    initialData: () => {
      if (typeof window === "undefined") {
        return null;
      }
      const session = localStorage.getItem("yfi-session");
      if (!session) {
        return null;
      }
      return JSON.parse(session).data;
    },
    initialDataUpdatedAt: () => {
      if (typeof window === "undefined") {
        return null;
      }
      const session = localStorage.getItem("yfi-session");
      if (!session) {
        return null;
      }
      return JSON.parse(session).time;
    },
  });
}

/**
 * Force tanstack query to refetch session next time page reloads
 *
 * Useful for social login/logout which will trigger a hard reload
 */
export function invalidateSessionLocalstorage() {
  if (typeof window === "undefined") return;
  const sessionCache = localStorage.getItem("yfi-session");
  if (!sessionCache) return;
  const sessionObj = JSON.parse(sessionCache);
  localStorage.setItem(
    "yfi-session",
    JSON.stringify({
      ...sessionObj,
      time: 0,
    }),
  );
}

/**
 * A hook that checks URL search params for `refetch-session=true` on mount,
 * and if found, refetches the session using the provided AuthClient.
 * After refetching, it removes the `refetch-session` param from the URL
 * to prevent repeated refetching on subsequent mounts.
 */
export function useSearchParamRefetchSessionEffect() {
  const authClient = useContext(AuthClientRefContext).current;
  const queryClient = useQueryClient();
  useUrlRefetchEffect(() => {
    console.debug("Refetching session due to URL param");
    void queryClient.invalidateQueries(sessionOptions(authClient));
  });
}

function useUrlRefetchEffect(cb: () => void) {
  const ref = useRef(cb);
  useLayoutEffect(() => {
    ref.current = cb;
  }, [cb]);
  useEffect(() => {
    if (window.location.search.includes("refetch-session=true")) {
      ref.current();
      const url = new URL(window.location.href);
      url.searchParams.delete("refetch-session");
      window.history.replaceState({}, "", url.href);
    }
  }, []);
}

export const SORT_BY_OPTIONS = ["created_desc", "created_asc"] as const;
export const SORT_BY_LABELS = {
  created_desc: "最新",
  created_asc: "最早",
} as const;
export const sortByAtom =
  atom<(typeof SORT_BY_OPTIONS)[number]>("created_desc");

export const persistentEmailAtom = atomWithStorage<string>(
  "persistentEmail",
  "",
);
export const persistentNameAtom = atomWithStorage<string>("persistentName", "");
export const persistentAsVisitorAtom = atomWithStorage<boolean>(
  "persistentAsVisitor",
  false,
);
