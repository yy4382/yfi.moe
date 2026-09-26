import * as stylex from "@stylexjs/stylex";
import { AutoResizeHeight } from "@/components/transitions/auto-resize-height";
import { useSearchParamRefetchSessionEffect } from "@/lib/auth/refetch-session-url";
import { CommentProvider } from "../components/provider";
import "../components/ui/ui.css";
import { CommentBoxNew } from "./box";
import { styles } from "./index.stylex";
import { CommentList } from "./list";

export type CommentYulineProps = {
  serverURL: string;
  pathname: string;
};
export default function CommentYuline({
  serverURL,
  pathname,
}: CommentYulineProps) {
  return (
    <CommentProvider serverURL={serverURL} pathname={pathname}>
      <AutoResizeHeight duration={0.1}>
        <div {...stylex.props(styles.root)}>
          <CommentBoxNew />
        </div>
      </AutoResizeHeight>
      <CommentList />
      <SearchParamsRefetchSessionHandler />
    </CommentProvider>
  );
}

function SearchParamsRefetchSessionHandler() {
  useSearchParamRefetchSessionEffect();
  return null;
}
