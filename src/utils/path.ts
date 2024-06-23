import { sitePaths } from "@config";

export function getPostPath(slug: string | undefined): string;
export function getPostPath(entry: CollectionEntry<"post">): string;

export function getPostPath(
  entryOrSlug: CollectionEntry<"post"> | string | undefined,
) {
  if (entryOrSlug === undefined) return "";
  if (typeof entryOrSlug === "string")
    return `${sitePaths.postPrefix}/${entryOrSlug}`;
  else return getPostPath(entryOrSlug.slug);
}
