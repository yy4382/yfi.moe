import { blurhashToImageCssObject, type CSSObject } from "@unpic/placeholder";
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";

export interface ImageMeta {
  url: string;
  width: number;
  height: number;
  blurhash: string;
}

export interface RehypeImageMetadataOptions {
  /**
   * If true, a CSS blurhash placeholder will be applied using the
   * `@unpic/placeholder` helpers.
   */
  enablePlaceholder?: boolean;
}

export const IMAGE_META_KEY = "imageMeta";

declare module "vfile" {
  interface DataMap {
    imageMeta?: ImageMeta[];
  }
}

export function rehypeImageMetadata(options: RehypeImageMetadataOptions = {}) {
  const { enablePlaceholder = true } = options;
  return function transformer(tree: Root, file: VFile) {
    const meta =
      file.data.imageMeta ??
      (file.data[IMAGE_META_KEY] as ImageMeta[] | undefined);
    if (!Array.isArray(meta) || meta.length === 0) {
      return;
    }
    const metaMap = new Map(
      meta
        .filter((item) => isValidMeta(item))
        .map((item) => [item.url, item] as const),
    );
    if (metaMap.size === 0) {
      return;
    }
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;
      const src = getSrc(node);
      if (!src) return;
      const detail = metaMap.get(src);
      if (!detail) return;
      node.properties ||= {};
      if (!node.properties.width) {
        node.properties.width = detail.width;
      }
      if (!node.properties.height) {
        node.properties.height = detail.height;
      }
      if (enablePlaceholder && detail.blurhash) {
        const existingStyle = styleToString(node.properties.style);
        const { placeholderWidth, placeholderHeight } =
          getPlaceholderSize(detail);

        // workaround for https://github.com/ascorbic/unpic-placeholder/pull/13
        const placeholderStyle = cssObjectToString(
          blurhashToImageCssObject(
            detail.blurhash,
            placeholderWidth,
            placeholderHeight,
          ),
        );
        node.properties.style = mergeStyles(existingStyle, placeholderStyle);
        if (!node.properties["data-placeholder"]) {
          node.properties["data-placeholder"] = "blurhash";
        }
      }
    });
  };
}

function getSrc(node: Element) {
  const { src } = node.properties ?? {};
  if (typeof src === "string") return src;
  if (Array.isArray(src)) {
    return src.find((value) => typeof value === "string");
  }
  return undefined;
}

function styleToString(style: unknown): string {
  if (!style) return "";
  if (typeof style === "string") return style;
  if (Array.isArray(style)) {
    return style
      .map((value) => (typeof value === "string" ? value : ""))
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function mergeStyles(existing: string, addition: string) {
  const trimmedExisting = existing.trim();
  const trimmedAddition = addition.trim();
  if (!trimmedExisting) {
    return ensureSemicolon(trimmedAddition);
  }
  if (trimmedExisting.includes(trimmedAddition)) {
    return trimmedExisting;
  }
  const merged = `${ensureSemicolon(trimmedExisting)} ${ensureSemicolon(trimmedAddition)}`;
  return merged.trim();
}

function ensureSemicolon(style: string) {
  return style.endsWith(";") ? style : `${style};`;
}

function isValidMeta(meta: ImageMeta): meta is ImageMeta {
  return (
    typeof meta?.url === "string" &&
    typeof meta.width === "number" &&
    typeof meta.height === "number" &&
    typeof meta.blurhash === "string"
  );
}

function getPlaceholderSize(meta: ImageMeta) {
  const maxDimension = 32;
  const { width, height } = meta;
  if (width <= maxDimension && height <= maxDimension) {
    return { placeholderWidth: width, placeholderHeight: height };
  }
  const scale = Math.max(width, height) / maxDimension;
  const placeholderWidth = Math.max(1, Math.round(width / scale));
  const placeholderHeight = Math.max(1, Math.round(height / scale));
  return { placeholderWidth, placeholderHeight };
}

function cssObjectToString(css: CSSObject) {
  return Object.entries(css)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join("; ");
}

function camelToKebab(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
