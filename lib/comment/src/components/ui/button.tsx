import * as stylex from "@stylexjs/stylex";
import { Slot } from "radix-ui";
import * as React from "react";
import {
  colors,
  motion,
  radii,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";

type ButtonProps = Omit<React.ComponentProps<"button">, "className"> & {
  asChild?: boolean;
  stylexStyle?: stylex.StyleXStyles;
};

function Button({ asChild = false, stylexStyle, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      {...stylex.props(styles.root, stylexStyle)}
      {...props}
    />
  );
}

const styles = stylex.create({
  root: {
    alignItems: "center",
    backgroundColor: colors.accent,
    border: 0,
    borderRadius: radii.md,
    boxShadow: shadows.xs,
    color: colors.textOnAccent,
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    gap: spacing.sm,
    height: "2.25rem",
    justifyContent: "center",
    outline: "none",
    paddingBlock: spacing.sm,
    paddingInline: spacing.lg,
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color, box-shadow, opacity, transform",
    transitionTimingFunction: motion.easeStandard,
    whiteSpace: "nowrap",
    ":hover": {
      backgroundColor: colors.accentText,
      color: colors.surface,
    },
    ":active": {
      transform: "scale(0.98)",
    },
    ":focus-visible": {
      boxShadow: `0 0 0 3px color-mix(in srgb, ${colors.focusRing} 45%, transparent)`,
    },
    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
      pointerEvents: "none",
    },
  },
});

export { Button };
