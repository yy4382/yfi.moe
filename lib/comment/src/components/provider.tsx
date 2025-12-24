import { type PropsWithChildren, useRef, useEffect } from "react";
import type { CommentYulineProps } from "@/comment";
import { createHonoClient, type HonoClient } from "@/lib/api/create-client";
import { createAuthClient, type AuthClient } from "@/lib/auth/create-auth";
import {
  ServerURLContext,
  AuthClientRefContext,
  HonoClientRefContext,
  PathnameContext,
} from "@/lib/hooks/context";

export function CommentProvider({
  serverURL,
  pathname,
  children,
}: PropsWithChildren<CommentYulineProps>) {
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
          <PathnameContext value={pathname}>{children}</PathnameContext>
        </HonoClientRefContext>
      </AuthClientRefContext>
    </ServerURLContext>
  );
}
