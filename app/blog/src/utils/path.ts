import type { CollectionEntry } from "astro:content";
import { sitePaths } from "@configs/site";
export function getPostPath(
  entryOrSlug: CollectionEntry<"post"> | string | undefined,
): string {
  if (entryOrSlug === undefined) return "";
  if (typeof entryOrSlug === "string")
    return `${sitePaths.postPrefix}/${entryOrSlug}`;
  else return getPostPath(entryOrSlug.id);
}
