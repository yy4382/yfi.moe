import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { bundledLanguages } from "shiki/langs";
import { bundledThemes } from "shiki/themes";
import type { Pluggable } from "unified";

const highlighter = await createHighlighterCore({
  themes: [bundledThemes["catppuccin-macchiato"]],
  langs: Object.values(bundledLanguages),
  engine: createOnigurumaEngine(() => import("shiki/wasm")),
});

export const shikiPluggable: Pluggable = [
  rehypeShikiFromHighlighter,
  highlighter,
  { theme: "catppuccin-macchiato" },
];
