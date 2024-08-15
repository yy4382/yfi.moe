export default function remToPixel(rem: number): number {
  if (!globalThis.window) return rem * 16;
  const rootFontSize = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  );
  return rem * rootFontSize;
}
