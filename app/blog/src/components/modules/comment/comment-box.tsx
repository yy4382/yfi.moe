import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "@utils/hooks/usePathname";
import { useState } from "react";
import SendIcon from "~icons/mingcute/send-plane-line";

export function CommentBox() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(
        `/api/comments/${encodeURIComponent(pathname)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        },
      );
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", pathname] });
    },
  });
  const [content, setContent] = useState("");
  return (
    <div>
      <div className="group rounded-sm border border-container p-1 focus-within:ring focus-within:ring-primary">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a comment"
          className="field-sizing-content min-h-12 w-full resize-none bg-transparent px-1 py-0.5 text-sm outline-none"
        />
        <div className="flex items-center justify-between gap-2 px-1 text-xs text-comment">
          <div>{content.length} / 500</div>
          <button
            onClick={() => mutation.mutate(content)}
            className="flex items-center gap-0.5"
          >
            <SendIcon />
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
