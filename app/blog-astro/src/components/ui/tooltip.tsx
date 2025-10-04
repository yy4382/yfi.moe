"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui-components/react/tooltip";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import * as React from "react";
import { getStrictContext } from "@/lib/hooks/get-strict-context";
import { useControlledState } from "@/lib/hooks/use-controlled-state";

type TooltipContextType = {
  isOpen: boolean;
  setIsOpen: TooltipProps["onOpenChange"];
};

const [LocalTooltipProvider, useTooltip] =
  getStrictContext<TooltipContextType>("TooltipContext");

type TooltipProviderProps = React.ComponentProps<
  typeof TooltipPrimitive.Provider
>;

function TooltipProvider(props: TooltipProviderProps) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />;
}

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root>;

function Tooltip(props: TooltipProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <LocalTooltipProvider value={{ isOpen, setIsOpen }}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        {...props}
        onOpenChange={setIsOpen}
      />
    </LocalTooltipProvider>
  );
}

type TooltipTriggerProps = React.ComponentProps<
  typeof TooltipPrimitive.Trigger
>;

function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

type TooltipPortalProps = Omit<
  React.ComponentProps<typeof TooltipPrimitive.Portal>,
  "keepMounted"
>;

function TooltipPortal(props: TooltipPortalProps) {
  const { isOpen } = useTooltip();

  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipPrimitive.Portal
          keepMounted
          data-slot="tooltip-portal"
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

type TooltipPositionerProps = React.ComponentProps<
  typeof TooltipPrimitive.Positioner
>;

function TooltipPositioner(props: TooltipPositionerProps) {
  return (
    <TooltipPrimitive.Positioner data-slot="tooltip-positioner" {...props} />
  );
}

type TooltipPopupProps = Omit<
  React.ComponentProps<typeof TooltipPrimitive.Popup>,
  "render"
> &
  HTMLMotionProps<"div">;

function TooltipPopup({
  transition = { type: "spring", stiffness: 300, damping: 25 },
  ...props
}: TooltipPopupProps) {
  return (
    <TooltipPrimitive.Popup
      render={
        <motion.div
          key="tooltip-popup"
          data-slot="tooltip-popup"
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

type TooltipArrowProps = React.ComponentProps<typeof TooltipPrimitive.Arrow>;

function TooltipArrow(props: TooltipArrowProps) {
  return <TooltipPrimitive.Arrow data-slot="tooltip-arrow" {...props} />;
}

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipPortal,
  TooltipPositioner,
  TooltipPopup,
  TooltipArrow,
  useTooltip,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipPortalProps,
  type TooltipPositionerProps,
  type TooltipPopupProps,
  type TooltipArrowProps,
  type TooltipContextType,
};
