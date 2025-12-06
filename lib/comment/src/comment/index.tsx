import { useEffect, useRef } from "react";
import { AutoResizeHeight } from "@/components/transitions/auto-resize-height";
import { CommentBoxNew } from "./box/add-comment";
import {
  AuthClientRefContext,
  createAuthClient,
  PathnameContext,
  ServerURLContext,
  type AuthClient,
} from "./context";
import { CommentList } from "./list";
import { useSearchParamRefetchSessionEffect } from "./utils";

export type CommentYulineProps = {
  serverURL: string;
  pathname: string;
};
export default function CommentYuline({
  serverURL,
  pathname,
}: CommentYulineProps) {
  const authClientRef = useRef<AuthClient>(createAuthClient(serverURL));
  useEffect(() => {
    authClientRef.current = createAuthClient(serverURL);
  }, [serverURL]);

  return (
    <ServerURLContext value={serverURL}>
      <AuthClientRefContext value={authClientRef}>
        <PathnameContext value={pathname}>
          <AutoResizeHeight duration={0.1}>
            <div className="p-0.5">
              <CommentBoxNew />
            </div>
          </AutoResizeHeight>
          <CommentList />
          <SearchParamsRefetchSessionHandler />
        </PathnameContext>
      </AuthClientRefContext>
    </ServerURLContext>
  );
}

function SearchParamsRefetchSessionHandler() {
  useSearchParamRefetchSessionEffect();
  return null;
}
