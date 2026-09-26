import * as stylex from "@stylexjs/stylex";
import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";
import { styles as buttonStyles } from "./button.stylex";
import "./ui.css";

function Button({
  className,
  styles,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  styles?: stylex.StyleXStyles;
}) {
  const Comp = asChild ? Slot.Root : "button";
  const styleProps = stylex.props(buttonStyles.root, styles);

  return (
    <Comp
      {...styleProps}
      data-slot="button"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

export { Button };
