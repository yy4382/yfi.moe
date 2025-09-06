import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommentItem } from "./list";
import type { CommentData } from "@repo/api/comment/comment-data";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AuthClientRefContext,
  createAuthClient,
  PathnameContext,
  ServerURLContext,
  type AuthClient,
} from "./context";
import { useRef } from "react";

function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  const authClientRef = useRef<AuthClient>(
    createAuthClient("http://localhost:3001/api/"),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ServerURLContext value="http://localhost:3001/api/">
        <AuthClientRefContext value={authClientRef}>
          <PathnameContext value="/post/test-post">{children}</PathnameContext>
        </AuthClientRefContext>
      </ServerURLContext>
    </QueryClientProvider>
  );
}

describe("CommentItem", () => {
  it("should render visitor's root comment by visitor", () => {
    const comment: CommentData = {
      id: 1,
      content: "<p>Visitor says</p>",
      rawContent: "Visitor says",
      parentId: null,
      replyToId: null,
      createdAt: new Date("2025-08-10T11:30:59.000Z"),
      updatedAt: new Date("2025-08-10T11:30:59.000Z"),
      path: "/post/test-post",
      displayName: "Visitor1",
      anonymousName: null,
      userImage: "https://example.com/image.png",
    };
    const queryClient = new QueryClient();
    render(<CommentItem comment={comment} />, {
      wrapper: ({ children }) => (
        <Provider queryClient={queryClient}>{children}</Provider>
      ),
    });

    expect(screen.getByText("Visitor says")).toBeInTheDocument();
    expect(screen.getByText("Visitor1")).toBeInTheDocument();
  });
});
