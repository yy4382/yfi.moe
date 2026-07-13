import type { StyleXStyles } from "@stylexjs/stylex";
import { JSX } from "react/jsx-runtime";

declare function CommentYuline({
  serverURL,
  pathname,
  style,
}: CommentYulineProps): JSX.Element;
export default CommentYuline;

declare type CommentYulineProps = {
  serverURL: string;
  pathname: string;
  style?: StyleXStyles;
};
