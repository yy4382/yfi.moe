"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import * as React from "react";
import { getStrictContext } from "@/lib/hooks/get-strict-context";
import { useControlledState } from "@/lib/hooks/use-controlled-state";
import { cn } from "@/lib/utils/cn";

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

type PopoverTriggerProps = React.ComponentProps<
  typeof PopoverPrimitive.Trigger
>;

function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
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

type PopoverBackdropProps = React.ComponentProps<
  typeof PopoverPrimitive.Backdrop
>;

function PopoverBackdrop({ className, ...props }: PopoverBackdropProps) {
  return (
    <PopoverPrimitive.Backdrop
      data-slot="popover-backdrop"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

type PopoverPositionerProps = React.ComponentProps<
  typeof PopoverPrimitive.Positioner
>;

function PopoverPositioner(props: PopoverPositionerProps) {
  return (
    <PopoverPrimitive.Positioner data-slot="popover-positioner" {...props} />
  );
}

type PopoverPopupProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Popup>,
  "render"
> &
  HTMLMotionProps<"div">;

function PopoverPopup({
  transition = { type: "spring", stiffness: 500, damping: 30, mass: 0.8 },
  ...props
}: PopoverPopupProps) {
  return (
    <PopoverPrimitive.Popup
      render={
        <motion.div
          key="popover-popup"
          data-slot="popover-popup"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={transition}
          {...props}
        />
      }
    />
  );
}

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
