import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CommentYuline from "./comment/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CommentYuline
        pathname={window.location.pathname}
        serverURL="http://localhost:3001/api/"
      />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
