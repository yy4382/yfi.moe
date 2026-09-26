import * as stylex from "@stylexjs/stylex";
import type { PropsWithChildren } from "react";
import { styles } from "./logo.stylex";

export function Logo({ children }: PropsWithChildren) {
  return (
    <a href="/" {...stylex.props(styles.root)}>
      {children}
    </a>
  );
}
