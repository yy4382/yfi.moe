import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CommentList } from "./comment-list";
import { CommentBox } from "./comment-box";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export function CommentCard() {
  return (
    <QueryClientProvider client={queryClient}>
      <CommentBox />
      <CommentList />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
