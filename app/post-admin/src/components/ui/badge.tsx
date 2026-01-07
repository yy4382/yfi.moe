import type { ReactNode } from "react";

interface BadgeProps {
  count?: number;
  showZero?: boolean;
  children: ReactNode;
}

export function Badge({ count = 0, showZero = false, children }: BadgeProps) {
  const showBadge = count > 0 || showZero;

  return (
    <span className="relative inline-flex">
      {children}
      {showBadge && (
        <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}
