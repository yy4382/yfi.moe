import { CommentBoxNew } from "./box";
import { YulineContext } from "./utils";
import { Provider as JotaiProvider } from "jotai";
import { CommentList } from "./list";

export default function CommentYuline({
  serverURL,
  pathname,
}: {
  serverURL: string;
  pathname: string;
}) {
  let decodedPathname;
  try {
    decodedPathname = decodeURI(pathname);
  } catch {
    decodedPathname = pathname;
  }

  return (
    <JotaiProvider>
      <YulineContext
        value={{
          serverURL,
          lang: typeof navigator !== "undefined" ? navigator.language : "zh-CN",
          url: decodedPathname,
          ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }}
      >
        <CommentBoxNew />
        <CommentList />
      </YulineContext>
    </JotaiProvider>
  );
}
