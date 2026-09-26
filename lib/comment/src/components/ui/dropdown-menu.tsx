"use client";

import * as stylex from "@stylexjs/stylex";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import * as React from "react";
import MingcuteCheckLine from "~icons/mingcute/check-line";
import MingcuteRightLine from "~icons/mingcute/right-line";
import MingcuteRoundLine from "~icons/mingcute/round-line";
import { cn } from "@/lib/utils";
import { styles as dropdownStyles } from "./dropdown-menu.stylex";
import "./ui.css";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(styles);
  return (
    <DropdownMenuPrimitive.Trigger
      {...styleProps}
      data-slot="dropdown-menu-trigger"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  styles,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(dropdownStyles.content, styles);
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        {...styleProps}
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(styleProps.className, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(styles);
  return (
    <DropdownMenuPrimitive.Group
      {...styleProps}
      data-slot="dropdown-menu-group"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  styles,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  styles?: stylex.StyleXStyles;
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  const styleProps = stylex.props(
    dropdownStyles.item,
    variant === "destructive" && dropdownStyles.destructiveItem,
    styles,
  );
  return (
    <DropdownMenuPrimitive.Item
      {...styleProps}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  styles,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(dropdownStyles.selectionItem, styles);
  return (
    <DropdownMenuPrimitive.CheckboxItem
      {...styleProps}
      data-slot="dropdown-menu-checkbox-item"
      className={cn(styleProps.className, className)}
      checked={checked}
      {...props}
    >
      <span {...stylex.props(dropdownStyles.indicator)}>
        <DropdownMenuPrimitive.ItemIndicator>
          <MingcuteCheckLine {...stylex.props(dropdownStyles.icon)} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(styles);
  return (
    <DropdownMenuPrimitive.RadioGroup
      {...styleProps}
      data-slot="dropdown-menu-radio-group"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  styles,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(dropdownStyles.selectionItem, styles);
  return (
    <DropdownMenuPrimitive.RadioItem
      {...styleProps}
      data-slot="dropdown-menu-radio-item"
      className={cn(styleProps.className, className)}
      {...props}
    >
      <span {...stylex.props(dropdownStyles.indicator)}>
        <DropdownMenuPrimitive.ItemIndicator>
          <MingcuteRoundLine
            {...stylex.props(dropdownStyles.icon, dropdownStyles.radioIcon)}
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  styles,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  styles?: stylex.StyleXStyles;
  inset?: boolean;
}) {
  const styleProps = stylex.props(dropdownStyles.label, styles);
  return (
    <DropdownMenuPrimitive.Label
      {...styleProps}
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(dropdownStyles.separator, styles);
  return (
    <DropdownMenuPrimitive.Separator
      {...styleProps}
      data-slot="dropdown-menu-separator"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  styles,
  ...props
}: React.ComponentProps<"span"> & { styles?: stylex.StyleXStyles }) {
  const styleProps = stylex.props(dropdownStyles.shortcut, styles);
  return (
    <span
      {...styleProps}
      data-slot="dropdown-menu-shortcut"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  styles,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  styles?: stylex.StyleXStyles;
  inset?: boolean;
}) {
  const styleProps = stylex.props(dropdownStyles.subTrigger, styles);
  return (
    <DropdownMenuPrimitive.SubTrigger
      {...styleProps}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(styleProps.className, className)}
      {...props}
    >
      {children}
      <MingcuteRightLine {...stylex.props(dropdownStyles.subTriggerIcon)} />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(dropdownStyles.subContent, styles);
  return (
    <DropdownMenuPrimitive.SubContent
      {...styleProps}
      data-slot="dropdown-menu-sub-content"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
