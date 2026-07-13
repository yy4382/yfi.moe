"use client";

import * as stylex from "@stylexjs/stylex";
import { Label as LabelPrimitive } from "radix-ui";
import * as React from "react";
import { spacing, typography } from "@repo/design-tokens/tokens.stylex";

type LabelProps = Omit<
  React.ComponentProps<typeof LabelPrimitive.Root>,
  "className"
> & { stylexStyle?: stylex.StyleXStyles };

function Label({ stylexStyle, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      {...stylex.props(styles.root, stylexStyle)}
      {...props}
    />
  );
}

const styles = stylex.create({
  root: {
    alignItems: "center",
    display: "flex",
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    gap: spacing.sm,
    lineHeight: 1,
    userSelect: "none",
  },
});

export { Label };
