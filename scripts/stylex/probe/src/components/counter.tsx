import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { styles } from "./probe.stylex";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      {...stylex.props(styles.button, styles.dynamic(160 + count))}
      onClick={() => setCount(count + 1)}
    >
      Count: {count}
    </button>
  );
}
