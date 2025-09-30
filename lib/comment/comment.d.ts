import { JSX } from "react/jsx-runtime";

declare function CommentYuline({
  serverURL,
  pathname,
}: CommentYulineProps): JSX.Element;
export default CommentYuline;

declare type CommentYulineProps = {
  serverURL: string;
  pathname: string;
};
