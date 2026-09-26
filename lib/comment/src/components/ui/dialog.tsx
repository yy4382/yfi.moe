"use client";

import * as stylex from "@stylexjs/stylex";
import { Dialog as DialogPrimitive } from "radix-ui";
import * as React from "react";
import MingcuteCloseLine from "~icons/mingcute/close-line";
import { cn } from "@/lib/utils";
import { styles as dialogStyles } from "./dialog.stylex";
import "./ui.css";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(styles);
  return (
    <DialogPrimitive.Trigger
      {...styleProps}
      data-slot="dialog-trigger"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(styles);
  return (
    <DialogPrimitive.Close
      {...styleProps}
      data-slot="dialog-close"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DialogOverlay({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(dialogStyles.overlay, styles);

  return (
    <DialogPrimitive.Overlay
      {...styleProps}
      data-slot="dialog-overlay"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  styles,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  styles?: stylex.StyleXStyles;
  showCloseButton?: boolean;
}) {
  const styleProps = stylex.props(dialogStyles.content, styles);

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        {...styleProps}
        data-slot="dialog-content"
        className={cn(styleProps.className, className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            {...stylex.props(dialogStyles.close)}
            data-slot="dialog-close"
          >
            <MingcuteCloseLine {...stylex.props(dialogStyles.closeIcon)} />
            <span {...stylex.props(dialogStyles.visuallyHidden)}>Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  styles,
  ...props
}: React.ComponentProps<"div"> & { styles?: stylex.StyleXStyles }) {
  const styleProps = stylex.props(dialogStyles.header, styles);
  return (
    <div
      {...styleProps}
      data-slot="dialog-header"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  styles,
  ...props
}: React.ComponentProps<"div"> & { styles?: stylex.StyleXStyles }) {
  const styleProps = stylex.props(dialogStyles.footer, styles);
  return (
    <div
      {...styleProps}
      data-slot="dialog-footer"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(dialogStyles.title, styles);
  return (
    <DialogPrimitive.Title
      {...styleProps}
      data-slot="dialog-title"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(dialogStyles.description, styles);
  return (
    <DialogPrimitive.Description
      {...styleProps}
      data-slot="dialog-description"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
