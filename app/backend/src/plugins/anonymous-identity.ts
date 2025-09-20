import { factory } from "@/factory.js";
import { getCookie, setCookie } from "hono/cookie";
import { randomUUID } from "node:crypto";

const DEFAULT_COOKIE_NAME = "anon_key";
const DEFAULT_HEADER_NAME = "x-anonymous-key";
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 365; // one year

type EnsureOptions = {
  exposeHeader?: boolean;
};

export type AnonymousIdentity = {
  getKey(): string | null;
  ensureKey(options?: EnsureOptions): { key: string; created: boolean };
};

export type AnonymousIdentityPluginOptions = {
  cookieName?: string;
  headerName?: string;
  maxAgeSeconds?: number;
};

export const anonymousIdentityPlugin = (
  options: AnonymousIdentityPluginOptions = {},
) => {
  const cookieName = options.cookieName ?? DEFAULT_COOKIE_NAME;
  const headerName = options.headerName ?? DEFAULT_HEADER_NAME;
  const maxAge = options.maxAgeSeconds ?? DEFAULT_MAX_AGE;
  const secure = true;

  return factory.createMiddleware((c, next) => {
    const getKey = () => getCookie(c, cookieName) ?? null;

    const ensureKey: AnonymousIdentity["ensureKey"] = ({
      exposeHeader = true,
    } = {}) => {
      const existing = getKey();
      if (existing) {
        if (exposeHeader) {
          c.header(headerName, existing, { append: false });
        }
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
      if (exposeHeader) {
        c.header(headerName, key, { append: false });
      }
      return { key, created: true };
    };

    const identity: AnonymousIdentity = {
      getKey,
      ensureKey,
    };

    c.set("anonymousIdentity", identity);

    return next();
  });
};

export const ANONYMOUS_IDENTITY_HEADER = DEFAULT_HEADER_NAME;
export const ANONYMOUS_IDENTITY_COOKIE = DEFAULT_COOKIE_NAME;
