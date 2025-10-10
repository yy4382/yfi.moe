import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import type { Element } from "hast";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { bundledLanguages, type BundledLanguage } from "shiki/langs";
import { bundledThemes } from "shiki/themes";
import type { Pluggable, Plugin, Preset } from "unified";
import { visit, CONTINUE, SKIP } from "unist-util-visit";

const highlighter = await createHighlighterCore({
  themes: [bundledThemes["catppuccin-macchiato"]],
  // initially empty, the `remarkCodeLangDetecter` will load the languages
  langs: [],
  engine: createOnigurumaEngine(() => import("shiki/wasm")),
});

const loadedLangs = new Set<string>();

const shikiPluggable: Pluggable = [
  rehypeShikiFromHighlighter,
  highlighter,
  { theme: "catppuccin-macchiato" },
];

export const rehypeShikiPreset: Preset = {
  plugins: [rehypeCodeLangDetecter, shikiPluggable],
};

function rehypeCodeLangDetecter(): ReturnType<Plugin> {
  return async (tree, file) => {
    const langs: string[] = [];
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "code") return CONTINUE;
      if (!node.properties.className) return CONTINUE;
      const className = node.properties.className;
      if (!Array.isArray(className)) return CONTINUE;
      const lang = className.find(
        (cls): cls is string =>
          typeof cls === "string" && cls.startsWith("language-"),
      );
      if (!lang) return CONTINUE;
      langs.push(lang.slice("language-".length));
      return SKIP;
    });
    file.data.langs = langs;
    for (const lang of langs) {
      if (loadedLangs.has(lang)) continue;
      if (!(lang in bundledLanguages)) continue;
      const langRegistration = bundledLanguages[lang as BundledLanguage];
      await highlighter.loadLanguage(langRegistration);
      loadedLangs.add(lang);
    }
  };
}
