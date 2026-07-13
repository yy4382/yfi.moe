"use client";

import * as stylex from "@stylexjs/stylex";
import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";

type StyledProps<T> = Omit<T, "className"> & {
  stylexStyle?: stylex.StyleXStyles;
};

function Tabs({
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof TabsPrimitive.Root>>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      {...stylex.props(styles.root, stylexStyle)}
      {...props}
    />
  );
}

function TabsList({
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof TabsPrimitive.List>>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      {...stylex.props(styles.list, stylexStyle)}
      {...props}
    />
  );
}

function TabsTrigger({
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof TabsPrimitive.Trigger>>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      {...stylex.props(styles.trigger, stylexStyle)}
      {...props}
    />
  );
}

function TabsContent({
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof TabsPrimitive.Content>>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      {...stylex.props(styles.content, stylexStyle)}
      {...props}
    />
  );
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
  list: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    color: colors.textMuted,
    display: "inline-flex",
    height: "2.25rem",
    justifyContent: "center",
    padding: "3px",
    width: "fit-content",
  },
  trigger: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors.textSecondary,
    display: "inline-flex",
    flex: 1,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    gap: "0.375rem",
    height: "calc(100% - 1px)",
    justifyContent: "center",
    outline: "none",
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    whiteSpace: "nowrap",
    ":focus-visible": {
      borderColor: colors.focusRing,
      outlineColor: colors.focusRing,
      outlineOffset: "1px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    ":disabled": {
      opacity: 0.5,
      pointerEvents: "none",
    },
    ":is([data-state='active'])": {
      backgroundColor: colors.surface,
      boxShadow: shadows.sm,
      color: colors.textPrimary,
    },
  },
  content: {
    flex: 1,
    outline: "none",
  },
});

export { Tabs, TabsContent, TabsList, TabsTrigger };
