import * as stylex from "@stylexjs/stylex";
import { format, isSameDay } from "date-fns";
import {
  colors,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import { MaskIcon } from "@/components/ui/mask-icon";
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
  const trigger = <DateWithIcon date={time.publishedDate} />;

  if (!time.writingDate && !updateDateMatters) return trigger;
  return (
    <Popover>
      <PopoverTrigger openOnHover>{trigger}</PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner sideOffset={4} stylexStyle={styles.positioner}>
          <PopoverPopup stylexStyle={styles.popup}>
            <div {...stylex.props(styles.stack)}>
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
  formatTemplate = "yyyy-MM-dd",
}: {
  date: Date;
  formatTemplate?: string;
}) {
  return (
    <div {...stylex.props(styles.date)}>
      <MaskIcon name="lucide-calendar" style={styles.icon} />
      {format(date, formatTemplate)}
    </div>
  );
}

const styles = stylex.create({
  positioner: { zIndex: 50 },
  popup: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderDefault,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.sm,
    color: colors.textSecondary,
    fontSize: typography.sizeXs,
    fontVariantNumeric: "tabular-nums",
    paddingBlock: "0.375rem",
    paddingInline: spacing.md,
    textWrap: "balance",
    transformOrigin: "var(--transform-origin)",
    width: "fit-content",
    willChange: "transform",
    zIndex: 50,
  },
  stack: { display: "flex", flexDirection: "column", gap: spacing.sm },
  date: { alignItems: "center", display: "flex", userSelect: "none" },
  icon: { height: "1rem", marginInlineEnd: spacing.xs, width: "1rem" },
});
