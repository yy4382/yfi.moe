import { useEffect, useRef } from "react";
import { AutoResizeHeight } from "@/components/transitions/auto-resize-height";
import { CommentBoxNew } from "./box/add-comment";
import {
  AuthClientRefContext,
  createAuthClient,
  createHonoClient,
  HonoClientRefContext,
  PathnameContext,
  ServerURLContext,
  type AuthClient,
  type HonoClient,
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
  const honoClientRef = useRef<HonoClient>(createHonoClient(serverURL));
  useEffect(() => {
    authClientRef.current = createAuthClient(serverURL);
    honoClientRef.current = createHonoClient(serverURL);
  }, [serverURL]);

  return (
    <ServerURLContext value={serverURL}>
      <AuthClientRefContext value={authClientRef}>
        <HonoClientRefContext value={honoClientRef}>
          <PathnameContext value={pathname}>
            <AutoResizeHeight duration={0.1}>
              <div className="p-0.5">
                <CommentBoxNew />
              </div>
            </AutoResizeHeight>
            <CommentList />
            <SearchParamsRefetchSessionHandler />
          </PathnameContext>
        </HonoClientRefContext>
      </AuthClientRefContext>
    </ServerURLContext>
  );
}

function SearchParamsRefetchSessionHandler() {
  useSearchParamRefetchSessionEffect();
  return null;
}
