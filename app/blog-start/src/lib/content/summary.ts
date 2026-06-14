import type { ContentEntry, ContentSummary } from "@/lib/content/source";

export function toContentSummary<TData>(
  entry: ContentEntry<TData>,
): ContentSummary<TData> {
  return {
    id: entry.id,
    data: entry.data,
  };
}
