// @ts-expect-error fontFamilyFallback is not correctly typed by vite-plugin-font
import { css, fontFamilyFallback } from "@/assets/fonts/MiSansVF.ttf";

export function FontStyle() {
  return (
    <style>{`:root{--font-family:${css.family};--font-family-fallback:${fontFamilyFallback};}`}</style>
  );
}
