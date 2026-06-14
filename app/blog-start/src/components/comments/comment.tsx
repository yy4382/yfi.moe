"use client";

import CommentYuline from "@repo/comment";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function Comment({
  pathname,
  serverURL,
}: {
  pathname: string;
  serverURL: string;
}) {
  const show = useHydrated();
  if (!show) {
    return <div />;
  }
  return <CommentYuline serverURL={serverURL} pathname={pathname} />;
}
