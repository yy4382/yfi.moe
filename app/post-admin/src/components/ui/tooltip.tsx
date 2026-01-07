import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import type { ReactNode } from "react";

interface TooltipProps {
  title: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({ title, children, side = "top" }: TooltipProps) {
  return (
    <BaseTooltip.Provider>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger className="cursor-default">
          {children}
        </BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} sideOffset={6}>
            <BaseTooltip.Popup className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
              {title}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
