import * as stylex from "@stylexjs/stylex";
import { format, isSameDay } from "date-fns";
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/motion-popover";
import type { ContentTimeData } from "@/content.config";
import { styles } from "./post-attr-time-tooltip.stylex";

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
        <PopoverPositioner sideOffset={4} {...stylex.props(styles.positioner)}>
          <PopoverPopup {...stylex.props(styles.popup)}>
            <div {...stylex.props(styles.details)}>
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
    <div {...stylex.props(styles.date)}>
      <span className={`${icon} ${stylex.props(styles.icon).className}`} />
      {format(date, formatTemplate)}
    </div>
  );
}
