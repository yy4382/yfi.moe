import { isSameDay } from "date-fns";
import { Calendar, SquarePenIcon, HashIcon } from "lucide-react";
import { format } from "date-fns";
import { Fragment } from "react";
import Link from "next/link";

export type PostAttrTimeProps = {
  date: Date;
  updated?: Date;
};
export function PostAttrTime({ date, updated }: PostAttrTimeProps) {
  return (
    <div className="flex items-center gap-2 select-none lg:gap-3">
      <div className="flex items-center select-none">
        <Calendar className="mr-1" size={16} />
        {format(date, "yyyy-MM-dd")}
      </div>
      {updated && !isSameDay(date, updated) && (
        <div className="flex items-center select-none">
          <SquarePenIcon className="mr-1" size={16} />
          {format(updated, "yyyy-MM-dd")}
        </div>
      )}
    </div>
  );
}

export type PostAttrTagsProps = {
  tags: string[];
};
export function PostAttrTags({ tags }: PostAttrTagsProps) {
  return (
    <div className="flex items-center select-none">
      <HashIcon className="mr-1" size={16} />
      <span className="space-x-0.5">
        {tags.map((tag, index) => (
          <Fragment key={tag}>
            {index !== 0 && <span className="text-comment">|</span>}
            <Link
              href={"/tags/" + tag}
              className="hover:text-accent-foreground transition"
              // disable prefetch because it's not likely to be clicked
              prefetch={false}
            >
              {tag}
            </Link>
          </Fragment>
        ))}
      </span>
    </div>
  );
}
