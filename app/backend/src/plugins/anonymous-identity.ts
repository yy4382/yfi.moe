import { getCookie, setCookie } from "hono/cookie";
import { randomUUID } from "node:crypto";
import SparkMd5 from "spark-md5";
import { factory } from "@/factory.js";

const DEFAULT_COOKIE_NAME = "anon_key";
const DEFAULT_HEADER_NAME = "x-anonymous-key";
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 365; // one year

export type AnonymousIdentity = {
  getKey(): string | null;
  ensureKey(): { key: string; created: boolean };
};

export type AnonymousIdentityPluginOptions = {
  cookieName?: string;
  headerName?: string;
  maxAgeSeconds?: number;
  alwaysSetHeaderIfExistsKeyInReqCookie?: boolean;
};

/**
 * Anonymous identity middleware.
 *
 * What it does
 * - Reads/writes a raw UUID in an httpOnly cookie (default: anon_key). That raw key also gets persisted in the DB when used.
 * - Exposes helpers on the context:
 *   - getKey(): returns the raw UUID from the cookie or null.
 *   - ensureKey(): creates a UUID if missing, sets the cookie, and sets a response header containing the MD5 hash of the raw key.
 * - If alwaysSetHeaderIfExistsKeyInReqCookie is true (default), any request that already has the cookie will also get the hashed key in the response header so the client can sync it.
 * - Hashing: the raw UUID never leaves the server/cookie; all response surfaces (headers, reaction payloads) use SparkMD5-hashed strings.
 *
 * Options
 * - cookieName: override the cookie name (default: anon_key)
 * - headerName: override the response header name (default: x-anonymous-key)
 * - maxAgeSeconds: cookie max-age (default: one year)
 * - alwaysSetHeaderIfExistsKeyInReqCookie: emit the hashed header on every request when the cookie is present (default: true)
 *
 * Usage
 * - Register: app.use(anonymousIdentityPlugin())
 * - Access: const identity = c.get("anonymousIdentity"); identity.ensureKey(); identity.getKey();
 */
export const anonymousIdentityPlugin = (
  options: AnonymousIdentityPluginOptions = {},
) => {
  const cookieName = options.cookieName ?? DEFAULT_COOKIE_NAME;
  const headerName = options.headerName ?? DEFAULT_HEADER_NAME;
  const maxAge = options.maxAgeSeconds ?? DEFAULT_MAX_AGE;
  const alwaysSetHeaderIfExistsKeyInReqCookie =
    options.alwaysSetHeaderIfExistsKeyInReqCookie ?? true;
  const secure = true;

  return factory.createMiddleware((c, next) => {
    const getKey = () => getCookie(c, cookieName) ?? null;

    const ensureKey: AnonymousIdentity["ensureKey"] = () => {
      const existing = getKey();
      if (existing) {
        c.header(headerName, SparkMd5.hash(existing), { append: false });
        return { key: existing, created: false };
      }
      const key = randomUUID();
      setCookie(c, cookieName, key, {
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
        secure,
        maxAge,
      });
      c.header(headerName, SparkMd5.hash(key), { append: false });
      return { key, created: true };
    };

    const identity: AnonymousIdentity = {
      getKey,
      ensureKey,
    };

    c.set("anonymousIdentity", identity);

    if (alwaysSetHeaderIfExistsKeyInReqCookie) {
      const key = getKey();
      if (key) {
        c.header(headerName, SparkMd5.hash(key), { append: false });
      }
    }

    return next();
  });
};

/**
 * Only use this export for tests.
 */
export const ANONYMOUS_IDENTITY_HEADER = DEFAULT_HEADER_NAME;
/**
 * Only use this export for tests.
 */
export const ANONYMOUS_IDENTITY_COOKIE = DEFAULT_COOKIE_NAME;
