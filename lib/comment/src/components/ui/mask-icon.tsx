import * as stylex from "@stylexjs/stylex";

export type CommentIconName =
  | "add-line"
  | "check-line"
  | "close-line"
  | "comment-line"
  | "delete-3-line"
  | "edit-line"
  | "emoji-line"
  | "github-line"
  | "loading-line"
  | "mail-send-line"
  | "more-1-line"
  | "right-line"
  | "round-line"
  | "send-plane-line"
  | "shield-shape-line";

interface MaskIconProps {
  name: CommentIconName;
  stylexStyle?: stylex.StyleXStyles;
}

export function MaskIcon({ name, stylexStyle }: MaskIconProps) {
  const attrs = stylex.props(styles.root, stylexStyle);

  return (
    <span
      aria-hidden="true"
      className={`${attrs.className ?? ""} i-mingcute-${name}`}
      style={attrs.style}
    />
  );
}

const styles = stylex.create({
  root: {
    display: "inline-block",
    flexShrink: 0,
    height: "1em",
    width: "1em",
  },
});
