import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

// Expose the query client for debugging purposes via the browser extension
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/react-query").QueryClient;
  }
}
if (typeof window !== "undefined") {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}
