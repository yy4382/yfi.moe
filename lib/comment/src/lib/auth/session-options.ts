import { queryOptions } from "@tanstack/react-query";
import type { AuthClient } from "./create-auth";

const SESSION_QUERY_KEY = ["session"];
const SESSION_LOCALSTORAGE_KEY = "yfi-session";

export function sessionOptions(authClient: AuthClient) {
  return queryOptions({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await authClient.getSession();
      if (res.error) {
        throw new Error(res.error.message);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(
          SESSION_LOCALSTORAGE_KEY,
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
      const session = localStorage.getItem(SESSION_LOCALSTORAGE_KEY);
      if (!session) {
        return null;
      }
      return JSON.parse(session).data;
    },
    initialDataUpdatedAt: () => {
      if (typeof window === "undefined") {
        return null;
      }
      const session = localStorage.getItem(SESSION_LOCALSTORAGE_KEY);
      if (!session) {
        return null;
      }
      return JSON.parse(session).time;
    },
  });
}

export const sessionOptionsKey = queryOptions({
  queryKey: SESSION_QUERY_KEY,
});

/**
 * Force tanstack query to refetch session next time page reloads
 *
 * Useful for social login/logout which will trigger a hard reload
 */
export function invalidateSessionLocalstorage() {
  if (typeof window === "undefined") return;
  const sessionCache = localStorage.getItem(SESSION_LOCALSTORAGE_KEY);
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
