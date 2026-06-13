import { PostAttrTimeTooltip } from "@/components/posts/post-attr-time-tooltip";
import type { ContentTimeData } from "@/lib/content/source";

export function PostAttrTime(time: ContentTimeData) {
  return (
    <PostAttrTimeTooltip
      time={{
        writingDate: time.writingDate,
        publishedDate: time.publishedDate,
        updatedDate: time.updatedDate,
      }}
    />
  );
}
