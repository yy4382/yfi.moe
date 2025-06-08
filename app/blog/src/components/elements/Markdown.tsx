import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import type { Root } from "hast";
import { mdComponents } from "@comp/md-components";

export function Markdown({ hast }: { hast: Root }) {
  let Comp;
  try {
    Comp = toJsxRuntime(hast, {
      Fragment,
      jsxs,
      jsx,
      development: import.meta.env.DEV,
      jsxDEV,
      components: mdComponents,
    });
  } catch (error) {
    console.error(error);
    return <div>Error rendering markdown</div>;
  }
  return Comp;
}
