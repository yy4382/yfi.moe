import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CommentYuline from "@repo/comment";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CommentYuline
        serverURL="http://localhost:3101/api/"
        pathname="/e2e/comments"
      />
    </QueryClientProvider>
  </StrictMode>,
);
