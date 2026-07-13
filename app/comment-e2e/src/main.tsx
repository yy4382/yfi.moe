import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CommentYuline from "@repo/comment";

if (import.meta.env.DEV) {
  void import("virtual:stylex:css-only");
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const fixturePath =
  new URLSearchParams(window.location.search).get("path") ?? "/e2e/comments";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CommentYuline
        serverURL="http://localhost:3101/api/"
        pathname={fixturePath}
      />
    </QueryClientProvider>
  </StrictMode>,
);
