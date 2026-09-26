/** Shared cascade contract for the app and independently compiled comment CSS. */
const layerOrder = [
  "properties",
  "reset",
  "theme",
  "base",
  "components",
  "prose",
  "icons",
  "utilities",
  "comment",
  "app",
] as const;

// Emit before stylesheet links so their insertion order cannot establish a
// different cascade. StyleX owns the priority sublayers inside each namespace.
export const stylexLayerOrder = `@layer ${layerOrder.join(", ")};`;

export function stylexLayers(namespace: "comment" | "app") {
  const index = layerOrder.indexOf(namespace);
  return {
    prefix: namespace,
    before: layerOrder.slice(0, index),
    after: layerOrder.slice(index + 1),
  };
}
