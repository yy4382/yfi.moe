import { QueryClientProvider } from "@tanstack/react-query";
import { WALINE_URL } from "astro:env/client";
import CommentYuline from "@repo/comment";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { queryClient } from "@/lib/query-client";

export function Comment({ pathname }: { pathname: string }) {
  const show = useHydrated();
  if (!show) {
    return <div></div>;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <CommentYuline serverURL={WALINE_URL} pathname={pathname} />
    </QueryClientProvider>
  );
}
