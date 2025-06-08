import { useMemo } from "react";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import type { Root } from "hast";

export function Markdown({ hast }: { hast: Root }) {
  const hast1 = useMemo(() => {
    return hast;
  }, [hast]);
  let Comp;
  try {
    Comp = toJsxRuntime(hast1, {
      Fragment,
      jsxs,
      jsx,
      development: import.meta.env.DEV,
      jsxDEV,
    });
  } catch (error) {
    console.error(error);
    return <div>Error rendering markdown</div>;
  }
  return Comp;
}
