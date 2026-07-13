import * as stylex from "@stylexjs/stylex";

export type AppIconName =
  | "lucide-calendar"
  | "lucide-check"
  | "lucide-chevron-left"
  | "lucide-chevron-right"
  | "lucide-copy"
  | "lucide-copyright"
  | "lucide-hash"
  | "lucide-list"
  | "lucide-map"
  | "lucide-menu"
  | "lucide-more-horizontal"
  | "lucide-rss"
  | "lucide-x"
  | "mingcute-compass-3-line"
  | "mingcute-external-link-line"
  | "mingcute-github-line"
  | "mingcute-mail-send-line"
  | "mingcute-telegram-line"
  | "mingcute-twitter-line";

export function MaskIcon({
  name,
  style,
}: {
  name: AppIconName;
  style?: stylex.StyleXStyles;
}) {
  const attrs = stylex.props(styles.root, style);
  return (
    <span
      aria-hidden="true"
      className={`${attrs.className ?? ""} i-${name}`}
      style={attrs.style}
    />
  );
}

const styles = stylex.create({
  root: { display: "inline-block", flexShrink: 0, height: "1em", width: "1em" },
});
