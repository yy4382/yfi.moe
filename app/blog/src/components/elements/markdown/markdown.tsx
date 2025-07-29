import "server-only";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
// @ts-expect-error this is a css file
import "@repo/markdown/style";
import { CopyButton } from "./components/copy-button";
import { GhCard } from "./components/gh-card";
import { unstable_cache } from "next/cache";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { markdownToHast } from "@repo/markdown/parse";
import { Redis } from "@upstash/redis";
import { after } from "next/server";

const redis = Redis.fromEnv({ cache: "force-cache" });

export async function Markdown({
  text,
  fast = false,
}: {
  text: string;
  fast?: boolean;
}) {
  const file = await unstable_cache(async (text: string, fast: boolean) => {
    const perfStart = performance.now();
    const hast = fast
      ? await markdownToHast(text, { fast })
      : await getHast(text);
    const perfEnd = performance.now();
    if (perfEnd - perfStart > 50) {
      console.debug(
        `markdownToHast took ${perfEnd - perfStart}ms: ${text
          .slice(0, 50)
          .replaceAll(/[\n\r]/g, "")}`,
      );
    }
    return hast;
  })(text, fast);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const Comp = toJsxRuntime(file, {
    Fragment,
    jsx,
    jsxs,
    jsxDEV,
    components: {
      "copy-button": CopyButton,
      "github-repo": GhCard,
    },
  });

  return <div>{Comp}</div>;
}

type Root = Awaited<ReturnType<typeof markdownToHast>>;

const hastReqPromises = new Map<string, Promise<Root>>();

async function getHast(text: string) {
  if (text.length < 500) {
    return await markdownToHast(text);
  }
  console.debug(
    "[markdown] trying to use redis cache: ",
    text.length,
    text.slice(0, 50).replaceAll(/[\n\r]/g, ""),
  );
  const hash = simpleHash(text);
  let promise = hastReqPromises.get(hash);
  if (!promise) {
    promise = redis
      .get<Root>(`hast:${hash}`)
      .then((value) => {
        if (value === null) {
          console.debug("[markdown] hast not found on redis, will cache");
          after(async () => {
            try {
              const hast = await markdownToHast(text);
              await redis.set(`hast:${hash}`, hast, {
                ex: 10 * 24 * 60 * 60 /* 10 days */,
              });
              console.info(
                "[markdown] cached hast: ",
                text.length,
                text.slice(0, 50).replaceAll(/[\n\r]/g, ""),
              );
            } catch (e) {
              console.error("Failed to cache hast", e);
            }
          });
          return Promise.reject(new Error("Hast not found"));
        }
        return value;
      })
      .finally(() => {
        hastReqPromises.delete(hash);
      });
    hastReqPromises.set(hash, promise);
  }
  const hast = Promise.any([promise, markdownToHast(text)]);
  return hast;
}

function simpleHash(str: string) {
  // FNV-1a hash - fast and good distribution
  let hash1 = 0x811c9dc5; // FNV offset basis
  let hash2 = 0x1000193; // FNV prime

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 ^= char;
    hash1 = Math.imul(hash1, 0x1000193);
    hash2 ^= char;
    hash2 = Math.imul(hash2, 0x811c9dc5);
  }

  // Combine two 32-bit hashes into a longer string
  return (hash1 >>> 0).toString(36) + (hash2 >>> 0).toString(36);
}
