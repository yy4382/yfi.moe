import { queryClient } from "@/lib/query-client";
import CommentYuline from "@repo/comment-waline";
import { QueryClientProvider } from "@tanstack/react-query";
import { WALINE_URL } from "astro:env/client";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function Comment({ pathname }: { pathname: string }) {
  console.log("Comment", pathname);
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);
  if (!show) {
    return <div></div>;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <CommentYuline serverURL={WALINE_URL} pathname={pathname} />
      <Toaster theme="system" />
    </QueryClientProvider>
  );
}
