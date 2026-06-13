"use client";

import CommentYuline from "@repo/comment";
import { getClientEnv } from "@/env/client";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function Comment({ pathname }: { pathname: string }) {
  const show = useHydrated();
  if (!show) {
    return <div />;
  }
  return (
    <CommentYuline
      serverURL={getClientEnv().VITE_WALINE_URL}
      pathname={pathname}
    />
  );
}
