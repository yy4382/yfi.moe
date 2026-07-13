"use client";

import * as stylex from "@stylexjs/stylex";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import * as React from "react";
import {
  colors,
  motion,
  radii,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";

type StyledProps<T> = Omit<T, "className"> & {
  stylexStyle?: stylex.StyleXStyles;
};

const enter = stylex.keyframes({
  from: { opacity: 0, transform: "scale(0.96) translateY(-0.25rem)" },
  to: { opacity: 1, transform: "scale(1) translateY(0)" },
});
const exit = stylex.keyframes({
  from: { opacity: 1, transform: "scale(1) translateY(0)" },
  to: { opacity: 0, transform: "scale(0.96) translateY(-0.25rem)" },
});

function DropdownMenu(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>,
) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  sideOffset = 4,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof DropdownMenuPrimitive.Content>>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        {...stylex.props(styles.content, stylexStyle)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

type DropdownMenuItemProps = StyledProps<
  React.ComponentProps<typeof DropdownMenuPrimitive.Item>
> & { variant?: "default" | "destructive" };

function DropdownMenuItem({
  variant = "default",
  stylexStyle,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      {...stylex.props(
        styles.item,
        variant === "destructive" && styles.destructive,
        stylexStyle,
      )}
      {...props}
    />
  );
}

const styles = stylex.create({
  content: {
    animationDuration: motion.durationFast,
    animationFillMode: "both",
    backgroundColor: colors.surfaceOverlay,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.md,
    color: colors.textPrimary,
    maxHeight: "var(--radix-dropdown-menu-content-available-height)",
    minWidth: "8rem",
    overflowX: "hidden",
    overflowY: "auto",
    padding: spacing.xs,
    transformOrigin: "var(--radix-dropdown-menu-content-transform-origin)",
    zIndex: 50,
    ":is([data-state='open'])": { animationName: enter },
    ":is([data-state='closed'])": { animationName: exit },
  },
  item: {
    alignItems: "center",
    borderRadius: radii.sm,
    cursor: "default",
    display: "flex",
    fontSize: typography.sizeSm,
    gap: spacing.sm,
    outline: "none",
    paddingBlock: "0.375rem",
    paddingInline: spacing.sm,
    position: "relative",
    userSelect: "none",
    ":focus": {
      backgroundColor: colors.surfaceInteractiveHover,
      color: colors.textPrimary,
    },
    ":is([data-disabled])": {
      opacity: 0.5,
      pointerEvents: "none",
    },
  },
  destructive: {
    color: colors.dangerText,
    ":focus": {
      backgroundColor: colors.dangerSurface,
      color: colors.dangerText,
    },
  },
});

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
};
