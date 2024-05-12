import { type CollectionEntry } from "astro:content";
import { path } from "@config";

export function getPostPath(slug: string | undefined): string;
export function getPostPath(entry: CollectionEntry<"post">): string;

export function getPostPath(entryOrSlug: CollectionEntry<"post"> | string | undefined) {
  if (entryOrSlug === undefined) return "";
  if (typeof entryOrSlug === "string")
    return `${path.postPrefix}/${entryOrSlug}`;
  else
    return getPostPath(entryOrSlug.slug);
}
