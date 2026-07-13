import * as stylex from "@stylexjs/stylex";
import type { PropsWithChildren } from "react";

export function Logo({ children }: PropsWithChildren) {
  return (
    <a href="/" {...stylex.props(styles.root)}>
      {children}
    </a>
  );
}

const styles = stylex.create({ root: { flexShrink: 0 } });
