"use client";

import * as stylex from "@stylexjs/stylex";
import { Label as LabelPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";
import { styles as labelStyles } from "./label.stylex";
import "./ui.css";

function Label({
  className,
  styles,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  styles?: stylex.StyleXStyles;
}) {
  const styleProps = stylex.props(labelStyles.root, styles);

  return (
    <LabelPrimitive.Root
      {...styleProps}
      data-slot="label"
      className={cn(styleProps.className, className)}
      {...props}
    />
  );
}

export { Label };
