import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent } from "react";
import { sessionOptionsKey } from "./session-options";

const REFETCH_SESSION_QUERY_PARAM = "refetch-session";

/**
 * A hook that checks URL search params for `refetch-session=true` on mount,
 * and if found, refetches the session using the provided AuthClient.
 * After refetching, it removes the `refetch-session` param from the URL
 * to prevent repeated refetching on subsequent mounts.
 */
export function useSearchParamRefetchSessionEffect() {
  const queryClient = useQueryClient();
  const invalidateSession = useEffectEvent(() => {
    console.debug("Refetching session due to URL param");
    void queryClient.invalidateQueries(sessionOptionsKey);
  });
  useEffect(() => {
    if (
      window.location.search.includes(`${REFETCH_SESSION_QUERY_PARAM}=true`)
    ) {
      invalidateSession();
      const url = new URL(window.location.href);
      url.searchParams.delete(REFETCH_SESSION_QUERY_PARAM);
      window.history.replaceState({}, "", url.href);
    }
  }, []);
}

/**
 * Get the URL with the `refetch-session` query param set to `true`
 *
 * Useful for social login/logout which will trigger a hard reload and requires
 * a refetch on returning to the page.
 *
 * @returns The URL with the `refetch-session` query param set to `true`
 */
export function getRefetchSessionUrl() {
  const callbackURL = new URL(window.location.href);
  callbackURL.searchParams.set(REFETCH_SESSION_QUERY_PARAM, "true");
  return callbackURL;
}
