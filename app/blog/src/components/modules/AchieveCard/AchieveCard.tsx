import type { CollectionEntry } from "astro:content";
import { getPostPath } from "@utils/path";
import { CompactEntryList } from "@comp/ui/CompactEntryList";
import { DateTime } from "luxon";
import { TooltipTime } from "@comp/ui/Tooltip";
import MingcuteCalendarLine from "~icons/mingcute/calendar-line";
import MingcuteHashtagLine from "~icons/mingcute/hashtag-line";

export type AchieveCardProps = {
  keyword?: string;
  rows: {
    year: string;
    posts: CollectionEntry<"post">[];
  }[];
};

export const AchieveCard: React.FC<AchieveCardProps> = ({
  keyword,
  rows,
}: AchieveCardProps) => {
  const rowsWithChildren = rows.map((row) => ({
    ...row,
    items: row.posts.map((item) => ({
      title: item.data.title,
      href: getPostPath(item),
      children: <AchieveAttr post={item} />,
    })),
  }));

  return <CompactEntryList keyword={keyword} rows={rowsWithChildren} />;
};

export type AchieveAttrProps = {
  post: CollectionEntry<"post">;
};

export const AchieveAttr: React.FC<AchieveAttrProps> = ({ post }) => {
  const postTime = DateTime.fromJSDate(post.data.date).toFormat("MM-dd");
  const updatedTime = DateTime.fromJSDate(post.data.updated).toFormat("MM-dd");

  return (
    <div className="flex h-4 max-w-full items-center gap-2 text-xs text-comment lg:gap-3">
      <div className="h-full flex-shrink-0">
        <TooltipTime postTime={postTime} updatedTime={updatedTime}>
          <div className="flex h-full items-center select-none">
            <MingcuteCalendarLine className="mr-1 text-base" />
            {postTime}
          </div>
        </TooltipTime>
      </div>
      {Array.isArray(post.data.tags) && (
        <div className="flex flex-shrink items-center justify-start overflow-hidden select-none">
          <MingcuteHashtagLine className="mr-1 text-base" />
          <span className="truncate">{post.data.tags.join(" | ")}</span>
        </div>
      )}
    </div>
  );
};
