import * as stylex from "@stylexjs/stylex";
import * as React from "react";
import { cn } from "@/lib/utils";
import { styles as inputStyles } from "./input.stylex";
import "./ui.css";

function Input({
  className,
  styles,
  type,
  ...props
}: React.ComponentProps<"input"> & { styles?: stylex.StyleXStyles }) {
  const styleProps = stylex.props(inputStyles.root, styles);

  return (
    <input
      {...styleProps}
      type={type}
      data-slot="input"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

export { Input };
