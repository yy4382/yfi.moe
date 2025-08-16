import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommentItem } from "./list";
import { CommentData } from "@repo/api/comment/comment-data";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BACKEND_URL: "http://localhost:3000",
  },
}));

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
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    expect(screen.getByText("Visitor says")).toBeInTheDocument();
    expect(screen.getByText("Visitor1")).toBeInTheDocument();
  });
});
