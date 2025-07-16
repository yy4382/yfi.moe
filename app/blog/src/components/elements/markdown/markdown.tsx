import "server-only";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import "@repo/markdown/style";
import { CopyButton } from "./components/copy-button";
import { GhCard } from "./components/gh-card";
import { unstable_cache } from "next/cache";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { markdownToHast } from "@repo/markdown/parse";

export async function Markdown({ text }: { text: string }) {
  const file = await unstable_cache(async (text: string) => {
    const perfStart = performance.now();
    const hast = markdownToHast(text);
    const perfEnd = performance.now();
    if (process.env.NODE_ENV === "development" && perfEnd - perfStart > 50) {
      console.debug(
        `markdownToHast took ${perfEnd - perfStart}ms: ${text
          .slice(0, 50)
          .replaceAll(/[\n\r]/g, "")}`,
      );
    }
    return hast;
  })(text);

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
