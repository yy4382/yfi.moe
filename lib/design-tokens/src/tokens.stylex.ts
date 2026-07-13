import * as stylex from "@stylexjs/stylex";

const DARK = "@media (prefers-color-scheme: dark)";

const colorValues = {
  canvas: {
    default: "oklch(0.9911 0 0)",
    [DARK]: "oklch(0.1822 0 0)",
  },
  surface: {
    default: "oklch(0.9911 0 0)",
    [DARK]: "oklch(0.2046 0 0)",
  },
  surfaceRaised: {
    default: "oklch(0.994 0 0)",
    [DARK]: "oklch(0.2603 0 0)",
  },
  surfaceOverlay: {
    default: "oklch(0.9911 0 0)",
    [DARK]: "oklch(0.2603 0 0)",
  },
  surfaceMuted: {
    default: "oklch(0.9461 0 0)",
    [DARK]: "oklch(0.2393 0 0)",
  },
  surfaceInteractive: {
    default: "oklch(0.9731 0 0)",
    [DARK]: "oklch(0.2603 0 0)",
  },
  surfaceInteractiveHover: {
    default: "oklch(0.9461 0 0)",
    [DARK]: "oklch(0.3132 0 0)",
  },
  textPrimary: {
    default: "oklch(0.2046 0 0)",
    [DARK]: "oklch(0.9288 0.0126 255.5078)",
  },
  textSecondary: {
    default: "oklch(0.4386 0 0)",
    [DARK]: "oklch(0.7348 0 0)",
  },
  textMuted: {
    default: "oklch(0.5452 0 0)",
    [DARK]: "oklch(0.6301 0 0)",
  },
  textOnAccent: {
    default: "oklch(0.2626 0.0147 166.4589)",
    [DARK]: "oklch(0 0 0)",
  },
  accent: {
    default: "oklch(0.8492 0.0821 293.1173)",
    [DARK]: "oklch(0.8492 0.0821 293.1173)",
  },
  accentText: {
    default: "oklch(0.4996 0.1409 292.68)",
    [DARK]: "oklch(0.8882 0.052 280)",
  },
  borderSubtle: {
    default: "oklch(0.9461 0 0)",
    [DARK]: "oklch(0.2393 0 0)",
  },
  borderDefault: {
    default: "oklch(0.9037 0 0)",
    [DARK]: "oklch(0.2809 0 0)",
  },
  borderStrong: {
    default: "oklch(0.708 0 0)",
    [DARK]: "oklch(0.442 0 0)",
  },
  focusRing: {
    default: "oklch(0.8391 0.0822 292.302)",
    [DARK]: "oklch(0.8023 0.0902 292.8473)",
  },
  danger: {
    default: "oklch(0.5523 0.1927 32.7272)",
    [DARK]: "oklch(0.681 0.19 28)",
  },
  dangerSurface: {
    default: "oklch(0.95 0.04 30)",
    [DARK]: "oklch(0.3123 0.0852 29.7877)",
  },
  dangerText: {
    default: "oklch(0.43 0.16 30)",
    [DARK]: "oklch(0.9368 0.0045 34.3092)",
  },
  success: {
    default: "oklch(0.58 0.15 155)",
    [DARK]: "oklch(0.72 0.16 155)",
  },
  successSurface: {
    default: "oklch(0.96 0.05 155)",
    [DARK]: "oklch(0.29 0.07 155)",
  },
  warning: {
    default: "oklch(0.68 0.15 75)",
    [DARK]: "oklch(0.82 0.15 75)",
  },
  warningSurface: {
    default: "oklch(0.96 0.05 75)",
    [DARK]: "oklch(0.3 0.07 75)",
  },
  overlayScrim: {
    default: "oklch(0 0 0 / 0.4)",
    [DARK]: "oklch(0 0 0 / 0.64)",
  },
} as const;

export const colors = stylex.defineVars({
  ...colorValues,
  "--color-canvas": colorValues.canvas,
  "--color-surface": colorValues.surface,
  "--color-surface-raised": colorValues.surfaceRaised,
  "--color-surface-overlay": colorValues.surfaceOverlay,
  "--color-surface-muted": colorValues.surfaceMuted,
  "--color-surface-interactive": colorValues.surfaceInteractive,
  "--color-surface-interactive-hover": colorValues.surfaceInteractiveHover,
  "--color-text-primary": colorValues.textPrimary,
  "--color-text-secondary": colorValues.textSecondary,
  "--color-text-muted": colorValues.textMuted,
  "--color-text-on-accent": colorValues.textOnAccent,
  "--color-accent": colorValues.accent,
  "--color-accent-text": colorValues.accentText,
  "--color-border-subtle": colorValues.borderSubtle,
  "--color-border-default": colorValues.borderDefault,
  "--color-border-strong": colorValues.borderStrong,
  "--color-focus-ring": colorValues.focusRing,
  "--color-danger": colorValues.danger,
  "--color-danger-surface": colorValues.dangerSurface,
  "--color-danger-text": colorValues.dangerText,
  "--color-success": colorValues.success,
  "--color-success-surface": colorValues.successSurface,
  "--color-warning": colorValues.warning,
  "--color-warning-surface": colorValues.warningSurface,
  "--color-overlay-scrim": colorValues.overlayScrim,
});

export const spacing = stylex.defineVars({
  none: "0",
  xxs: "0.125rem",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  xxl: "2rem",
  xxxl: "3rem",
  jumbo: "4rem",
});

const typographyValues = {
  bodyFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serifFamily: 'Georgia, "Songti SC", STSong, SimSun, serif',
  monoFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  sizeXs: "0.75rem",
  sizeSm: "0.875rem",
  sizeMd: "1rem",
  sizeLg: "1.125rem",
  sizeXl: "1.25rem",
  sizeXxl: "1.5rem",
  weightRegular: "400",
  weightMedium: "500",
  weightSemibold: "600",
  weightBold: "700",
  lineTight: "1.25",
  lineNormal: "1.5",
  lineRelaxed: "1.75",
  trackingNormal: "0.025em",
} as const;

export const typography = stylex.defineVars({
  ...typographyValues,
  "--font-body": typographyValues.bodyFamily,
  "--font-serif": typographyValues.serifFamily,
  "--font-mono": typographyValues.monoFamily,
  "--font-size-xs": typographyValues.sizeXs,
  "--font-size-sm": typographyValues.sizeSm,
  "--font-size-md": typographyValues.sizeMd,
  "--line-height-normal": typographyValues.lineNormal,
  "--line-height-relaxed": typographyValues.lineRelaxed,
});

export const radii = stylex.defineVars({
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  round: "9999px",
});

export const shadows = stylex.defineVars({
  xs: "0 1px 3px hsl(0 0% 0% / 0.09)",
  sm: "0 1px 3px hsl(0 0% 0% / 0.17), 0 1px 2px -1px hsl(0 0% 0% / 0.17)",
  md: "0 1px 3px hsl(0 0% 0% / 0.17), 0 2px 4px -1px hsl(0 0% 0% / 0.17)",
  lg: "0 1px 3px hsl(0 0% 0% / 0.17), 0 4px 6px -1px hsl(0 0% 0% / 0.17)",
  xl: "0 1px 3px hsl(0 0% 0% / 0.17), 0 8px 10px -1px hsl(0 0% 0% / 0.17)",
});

export const motion = stylex.defineVars({
  durationInstant: "80ms",
  durationFast: "120ms",
  durationNormal: "180ms",
  durationSlow: "280ms",
  durationDeliberate: "900ms",
  easeStandard: "cubic-bezier(0.2, 0, 0, 1)",
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
});
