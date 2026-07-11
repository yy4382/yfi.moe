import { getCookie, setCookie } from "hono/cookie";
import {
  GUEST_IDENTITY_HEADER,
  GUEST_IDENTITY_STATE_HEADER,
} from "@repo/guest-identity";
import type { ViewerIdentityScope } from "@repo/guest-identity/backend";
import { factory } from "@/factory.js";
import { guestIdentityPolicy } from "./guest-identity-policy.js";

export const GUEST_IDENTITY_COOKIE = "anon_key";
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 365;

export type GuestIdentity = {
  resolve(options?: { createGuestIfMissing?: boolean }): ViewerIdentityScope;
  commit(scope: ViewerIdentityScope): void;
};

export type GuestIdentityPluginOptions = {
  cookieName?: string;
  maxAgeSeconds?: number;
};

export function guestIdentityPlugin(options: GuestIdentityPluginOptions = {}) {
  const cookieName = options.cookieName ?? GUEST_IDENTITY_COOKIE;
  const maxAge = options.maxAgeSeconds ?? DEFAULT_MAX_AGE;
  return factory.createMiddleware((c, next) => {
    const incomingRawKey = getCookie(c, cookieName) ?? undefined;
    let pendingRawKey: string | undefined;

    const resolve: GuestIdentity["resolve"] = (resolveOptions = {}) => {
      const rawGuestCookie = incomingRawKey ?? pendingRawKey;
      const scope = guestIdentityPolicy.resolve({
        ...(c.get("auth")?.user.id
          ? { authenticatedUserId: c.get("auth")!.user.id }
          : {}),
        ...(rawGuestCookie ? { rawGuestCookie } : {}),
        ...(resolveOptions.createGuestIfMissing
          ? { createGuestIfMissing: true }
          : {}),
      });
      pendingRawKey ??= scope.response.setRawGuestCookie;
      if (pendingRawKey && !incomingRawKey) {
        return {
          ...scope,
          response: {
            ...scope.response,
            setRawGuestCookie: pendingRawKey,
          },
        };
      }
      return scope;
    };

    const commit: GuestIdentity["commit"] = (scope) => {
      if (scope.response.setRawGuestCookie) {
        setCookie(c, cookieName, scope.response.setRawGuestCookie, {
          httpOnly: true,
          sameSite: "Lax",
          path: "/",
          secure: true,
          maxAge,
        });
      }
      c.header(GUEST_IDENTITY_STATE_HEADER, scope.response.guestState, {
        append: false,
      });
      if (scope.response.projectedGuestKey) {
        c.header(GUEST_IDENTITY_HEADER, scope.response.projectedGuestKey, {
          append: false,
        });
      }
    };

    const guestIdentity: GuestIdentity = { resolve, commit };

    c.set("guestIdentity", guestIdentity);
    commit(resolve());
    return next();
  });
}
