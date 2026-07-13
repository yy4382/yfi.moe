"use client";

import * as stylex from "@stylexjs/stylex";
import { Dialog as DialogPrimitive } from "radix-ui";
import * as React from "react";
import {
  colors,
  motion,
  radii,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import { MaskIcon } from "./mask-icon";

type StyledProps<T> = Omit<T, "className"> & {
  stylexStyle?: stylex.StyleXStyles;
};

const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const fadeOut = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });
const contentIn = stylex.keyframes({
  from: { opacity: 0, transform: "translate(-50%, -48%) scale(0.95)" },
  to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});
const contentOut = stylex.keyframes({
  from: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
  to: { opacity: 0, transform: "translate(-50%, -48%) scale(0.95)" },
});

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof DialogPrimitive.Overlay>>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      {...stylex.props(styles.overlay, stylexStyle)}
      {...props}
    />
  );
}

type DialogContentProps = StyledProps<
  React.ComponentProps<typeof DialogPrimitive.Content>
> & { showCloseButton?: boolean };

function DialogContent({
  children,
  showCloseButton = true,
  stylexStyle,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        {...stylex.props(styles.content, stylexStyle)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label="关闭"
            {...stylex.props(styles.close)}
          >
            <MaskIcon name="close-line" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="dialog-header"
      {...stylex.props(styles.header, stylexStyle)}
      {...props}
    />
  );
}

function DialogTitle({
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof DialogPrimitive.Title>>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      {...stylex.props(styles.title, stylexStyle)}
      {...props}
    />
  );
}

function DialogDescription({
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof DialogPrimitive.Description>>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      {...stylex.props(styles.description, stylexStyle)}
      {...props}
    />
  );
}

const styles = stylex.create({
  overlay: {
    animationDuration: motion.durationNormal,
    animationFillMode: "both",
    backgroundColor: colors.overlayScrim,
    inset: 0,
    position: "fixed",
    zIndex: 50,
    ":is([data-state='open'])": { animationName: fadeIn },
    ":is([data-state='closed'])": { animationName: fadeOut },
  },
  content: {
    animationDuration: motion.durationNormal,
    animationFillMode: "both",
    backgroundColor: colors.surfaceOverlay,
    borderColor: colors.borderDefault,
    borderRadius: radii.lg,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.xl,
    display: "grid",
    gap: spacing.lg,
    left: "50%",
    maxWidth: "min(28rem, calc(100% - 2rem))",
    padding: spacing.xl,
    position: "fixed",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    zIndex: 50,
    ":is([data-state='open'])": { animationName: contentIn },
    ":is([data-state='closed'])": { animationName: contentOut },
  },
  close: {
    alignItems: "center",
    backgroundColor: "transparent",
    border: 0,
    borderRadius: radii.sm,
    color: colors.textMuted,
    cursor: "pointer",
    display: "inline-flex",
    height: "1.5rem",
    justifyContent: "center",
    opacity: 0.7,
    position: "absolute",
    right: spacing.lg,
    top: spacing.lg,
    transitionDuration: motion.durationFast,
    transitionProperty: "opacity",
    width: "1.5rem",
    ":hover": { opacity: 1 },
    ":focus-visible": {
      outlineColor: colors.focusRing,
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    textAlign: "center",
    "@media (min-width: 40rem)": { textAlign: "left" },
  },
  title: {
    fontSize: typography.sizeLg,
    fontWeight: typography.weightSemibold,
    lineHeight: 1,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.sizeSm,
  },
});

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
