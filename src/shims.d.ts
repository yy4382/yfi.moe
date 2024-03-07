import type { AttributifyAttributes } from "@unocss/preset-attributify";

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes extends AttributifyAttributes {}
  }
}

// declare namespace astroHTML.JSX {
//   interface HTMLAttributes {
//     bg?: string;
//   }
// }
