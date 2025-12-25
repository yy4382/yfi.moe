import { format, isSameDay } from "date-fns";
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/motion-popover";
import type { ContentTimeData } from "@/content.config";

export function PostAttrTimeTooltip({ time }: { time: ContentTimeData }) {
  const updateDateMatters =
    time.updatedDate && !isSameDay(time.publishedDate, time.updatedDate);

  const trigger = (
    <DateWithIcon date={time.publishedDate} icon="i-lucide-calendar" />
  );

  if (!time.writingDate && !updateDateMatters) {
    return trigger;
  }
  return (
    <Popover>
      <PopoverTrigger openOnHover>{trigger}</PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner sideOffset={4} className="z-50">
          <PopoverPopup className="z-50 w-fit origin-(--transform-origin) border bg-zinc-100 px-3 py-1.5 text-xs text-balance text-comment tabular-nums will-change-transform dark:bg-zinc-800">
            <div className="flex flex-col gap-2">
              {time.writingDate && (
                <div>
                  于 {format(time.writingDate, "yyyy-MM-dd HH:mm")} 开始写作
                </div>
              )}
              <div>
                于 {format(time.publishedDate, "yyyy-MM-dd HH:mm")} 发布
              </div>
              {updateDateMatters && (
                <div>
                  于 {format(time.updatedDate!, "yyyy-MM-dd HH:mm")} 最后更新
                </div>
              )}
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}

function DateWithIcon({
  date,
  icon,
  formatTemplate = "yyyy-MM-dd",
}: {
  date: Date;
  icon: string;
  formatTemplate?: string;
}) {
  return (
    <div className="flex items-center select-none">
      <span className={`mr-1 size-4 ${icon}`} />
      {format(date, formatTemplate)}
    </div>
  );
}
