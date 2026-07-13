"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import * as stylex from "@stylexjs/stylex";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import * as React from "react";
import {
  colors,
  motion as motionTokens,
} from "@repo/design-tokens/tokens.stylex";
import { getStrictContext } from "@/lib/hooks/get-strict-context";
import { useControlledState } from "@/lib/hooks/use-controlled-state";

type PopoverContextType = {
  isOpen: boolean;
  setIsOpen: PopoverProps["onOpenChange"];
};

const [PopoverProvider, usePopover] =
  getStrictContext<PopoverContextType>("PopoverContext");

type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root>;

function Popover(props: PopoverProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <PopoverProvider value={{ isOpen, setIsOpen }}>
      <PopoverPrimitive.Root
        data-slot="popover"
        {...props}
        onOpenChange={setIsOpen}
      />
    </PopoverProvider>
  );
}

type PopoverTriggerProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Trigger>,
  "className"
> & { stylexStyle?: stylex.StyleXStyles };

function PopoverTrigger({ stylexStyle, ...props }: PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      {...stylex.props(stylexStyle)}
      {...props}
    />
  );
}

type PopoverPortalProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Portal>,
  "keepMounted"
>;

function PopoverPortal(props: PopoverPortalProps) {
  const { isOpen } = usePopover();

  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPrimitive.Portal
          keepMounted
          data-slot="popover-portal"
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

type PopoverBackdropProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Backdrop>,
  "className"
> & { stylexStyle?: stylex.StyleXStyles };

function PopoverBackdrop({ stylexStyle, ...props }: PopoverBackdropProps) {
  return (
    <PopoverPrimitive.Backdrop
      data-slot="popover-backdrop"
      {...stylex.props(styles.backdrop, stylexStyle)}
      {...props}
    />
  );
}

type PopoverPositionerProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Positioner>,
  "className"
> & { stylexStyle?: stylex.StyleXStyles };

function PopoverPositioner({ stylexStyle, ...props }: PopoverPositionerProps) {
  return (
    <PopoverPrimitive.Positioner
      data-slot="popover-positioner"
      {...stylex.props(stylexStyle)}
      {...props}
    />
  );
}

type PopoverPopupProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Popup>,
  "render" | "className"
> &
  Omit<HTMLMotionProps<"div">, "className"> & {
    stylexStyle?: stylex.StyleXStyles;
  };

function PopoverPopup({
  transition = { ease: "easeOut", duration: 0.15 },
  stylexStyle,
  ...props
}: PopoverPopupProps) {
  return (
    <PopoverPrimitive.Popup
      render={
        <motion.div
          key="popover-popup"
          data-slot="popover-popup"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={transition}
          {...stylex.props(stylexStyle)}
          {...props}
        />
      }
    />
  );
}

const styles = stylex.create({
  backdrop: {
    backgroundColor: colors.overlayScrim,
    inset: 0,
    isolation: "isolate",
    opacity: 0.25,
    position: "fixed",
    transitionDuration: motionTokens.durationFast,
    transitionProperty: "opacity",
    zIndex: 50,
    ":is([data-ending-style])": { opacity: 0 },
    ":is([data-starting-style])": { opacity: 0 },
  },
});

type PopoverArrowProps = React.ComponentProps<typeof PopoverPrimitive.Arrow>;

function PopoverArrow(props: PopoverArrowProps) {
  return <PopoverPrimitive.Arrow data-slot="popover-arrow" {...props} />;
}

export {
  Popover,
  PopoverTrigger,
  PopoverPortal,
  PopoverBackdrop,
  PopoverPositioner,
  PopoverPopup,
  PopoverArrow,
  usePopover,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverPortalProps,
  type PopoverBackdropProps,
  type PopoverPositionerProps,
  type PopoverPopupProps,
  type PopoverArrowProps,
  type PopoverContextType,
};
