"use client";

import * as stylex from "@stylexjs/stylex";
import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";
import { styles as tabsStyles } from "./tabs.stylex";
import "./ui.css";

function Tabs({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(tabsStyles.root, styles);

  return (
    <TabsPrimitive.Root
      {...styleProps}
      data-slot="tabs"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(tabsStyles.list, styles);

  return (
    <TabsPrimitive.List
      {...styleProps}
      data-slot="tabs-list"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(tabsStyles.trigger, styles);

  return (
    <TabsPrimitive.Trigger
      {...styleProps}
      data-slot="tabs-trigger"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(tabsStyles.content, styles);

  return (
    <TabsPrimitive.Content
      {...styleProps}
      data-slot="tabs-content"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
