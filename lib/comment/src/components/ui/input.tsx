import * as stylex from "@stylexjs/stylex";
import * as React from "react";
import {
  colors,
  motion,
  radii,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";

type InputProps = Omit<React.ComponentProps<"input">, "className"> & {
  stylexStyle?: stylex.StyleXStyles;
};

function Input({ stylexStyle, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      {...stylex.props(styles.root, stylexStyle)}
      {...props}
    />
  );
}

const styles = stylex.create({
  root: {
    backgroundColor: "transparent",
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.xs,
    color: colors.textPrimary,
    fontSize: typography.sizeSm,
    height: "2.25rem",
    minWidth: 0,
    outline: "none",
    paddingBlock: spacing.xs,
    paddingInline: spacing.md,
    transitionDuration: motion.durationFast,
    transitionProperty: "border-color, box-shadow, opacity",
    transitionTimingFunction: motion.easeStandard,
    width: "100%",
    "::placeholder": {
      color: colors.textMuted,
    },
    ":focus-visible": {
      borderColor: colors.focusRing,
      boxShadow: `0 0 0 3px color-mix(in srgb, ${colors.focusRing} 40%, transparent)`,
    },
    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
      pointerEvents: "none",
    },
    ":is([aria-invalid='true'])": {
      borderColor: colors.danger,
    },
  },
});

export { Input };
