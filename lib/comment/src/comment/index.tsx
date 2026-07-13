import { AutoResizeHeight } from "#/components/transitions/auto-resize-height";
import { useSearchParamRefetchSessionEffect } from "#/lib/auth/refetch-session-url";
import "#/styles/comment-prose.css";
import "#/styles/icons.css";
import * as stylex from "@stylexjs/stylex";
import { spacing } from "@repo/design-tokens/tokens.stylex";
import { CommentProvider } from "../components/provider";
import { CommentBoxNew } from "./box";
import { CommentList } from "./list";

export type CommentYulineProps = {
  serverURL: string;
  pathname: string;
  style?: stylex.StyleXStyles;
};
export default function CommentYuline({
  serverURL,
  pathname,
  style,
}: CommentYulineProps) {
  return (
    <CommentProvider serverURL={serverURL} pathname={pathname}>
      <div {...stylex.props(styles.root, style)}>
        <AutoResizeHeight duration={0.1}>
          <div {...stylex.props(styles.composer)}>
            <CommentBoxNew />
          </div>
        </AutoResizeHeight>
        <CommentList />
        <SearchParamsRefetchSessionHandler />
      </div>
    </CommentProvider>
  );
}

function SearchParamsRefetchSessionHandler() {
  useSearchParamRefetchSessionEffect();
  return null;
}

const styles = stylex.create({
  root: {
    color: "inherit",
    containerType: "inline-size",
    width: "100%",
  },
  composer: {
    padding: spacing.xxs,
  },
});
