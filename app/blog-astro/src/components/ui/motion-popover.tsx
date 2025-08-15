/**
 * From animate ui popover https://animate-ui.com/docs/radix/popover
 *
 * MIT License
 * https://github.com/animate-ui/animate-ui
 */

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import { cn } from "@/lib/utils/cn";

type PopoverContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextType | undefined>(
  undefined,
);

const usePopover = (): PopoverContextType => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("usePopover must be used within a Popover");
  }
  return context;
};

type Side = "top" | "bottom" | "left" | "right";

const getInitialPosition = (side: Side, align: "start" | "center" | "end") => {
  const matchSide = (alignResult: string) => {
    switch (side) {
      case "top":
        return { y: "30%", x: alignResult };
      case "bottom":
        return { y: "-30%", x: alignResult };
      case "left":
        return { x: "30%", y: alignResult };
      case "right":
        return { x: "-30%", y: alignResult };
    }
  };
  const matchAlign = () => {
    switch (align) {
      case "start":
        return "-30%";
      case "center":
        return "0%";
      case "end":
        return "30%";
    }
  };
  return matchSide(matchAlign());
};

type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root>;

function Popover({ children, ...props }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(
    props?.open ?? props?.defaultOpen ?? false,
  );

  React.useEffect(() => {
    if (props?.open !== undefined) setIsOpen(props.open);
  }, [props?.open]);

  const { onOpenChange } = props;
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <PopoverPrimitive.Root
        data-slot="popover"
        {...props}
        onOpenChange={handleOpenChange}
      >
        {children}
      </PopoverPrimitive.Root>
    </PopoverContext.Provider>
  );
}

type PopoverTriggerProps = React.ComponentProps<
  typeof PopoverPrimitive.Trigger
>;

function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
> &
  HTMLMotionProps<"div"> & {
    transition?: Transition;
  };

function PopoverContent({
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  transition = { type: "spring", visualDuration: 0.2, bounce: 0.2 },
  children,
  ...props
}: PopoverContentProps) {
  const { isOpen, setIsOpen } = usePopover();
  const initialPosition = getInitialPosition(side, align);

  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPrimitive.Portal forceMount data-slot="popover-portal">
          <PopoverPrimitive.Content
            forceMount
            align={align}
            sideOffset={sideOffset}
            className="z-50"
            {...props}
          >
            <div
              className="relative -m-9 overflow-clip p-9"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                key="popover-content"
                data-slot="popover-content"
                initial={{ opacity: 0, scale: 0.5, ...initialPosition }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, ...initialPosition }}
                transition={transition}
                className={cn(className)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {children}
              </motion.div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type PopoverAnchorProps = React.ComponentProps<typeof PopoverPrimitive.Anchor>;

function PopoverAnchor({ ...props }: PopoverAnchorProps) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverContentProps,
  type PopoverAnchorProps,
};
