import type {
  CommentDataAdmin,
  CommentDataUser,
} from "@repo/api-datatypes/comment";
import { useState } from "react";
import ReplyIcon from "~icons/mingcute/comment-line";
import { CommentBox } from "./comment-box";
import DeleteIcon from "~icons/mingcute/delete-line";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionOptions } from "./session";

export function CommentEntry({
  entry,
}: {
  entry: CommentDataAdmin | CommentDataUser;
}) {
  const [replying, setReplying] = useState(false);
  const { data: session } = useQuery(sessionOptions());

  const queryClient = useQueryClient();

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (id: number) => {
      const resp = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        throw new Error("Failed to delete comment");
      }
      return await resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex items-end gap-3 border-gray-100 py-2 last:border-b-0">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          <img
            src={entry.userImage}
            alt={entry.displayName}
            className="size-9 rounded-full object-cover"
            onError={(e) => {
              // 如果头像加载失败，使用默认头像
              const target = e.target as HTMLImageElement;
              target.src = `https://avatar.vercel.sh/anonymous`;
            }}
          />
        </div>

        {/* 评论内容区域 */}
        <div className="group mb-1 min-w-0 flex-1">
          {/* 用户信息行 */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-title text-sm font-semibold">
              {entry.displayName}
            </span>
            {"isMine" in entry && entry.isMine && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
                我
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatTime(entry.createdAt)}
            </span>
            {(entry.isMine || session?.user.role === "admin") && (
              <button
                className="flex items-center gap-1 text-xs text-red-700 transition-colors hover:text-red-500"
                onClick={() => deleteComment(entry.id)}
              >
                <DeleteIcon /> 删除
              </button>
            )}
          </div>

          {/* 评论内容 */}
          <div className="relative inline-block rounded-md rounded-bl-none bg-gray-600/5 px-2 py-1 text-sm leading-relaxed break-words whitespace-pre-wrap text-content">
            {entry.content}
            <div className="absolute -right-0 -bottom-0 z-10 cursor-pointer">
              <button
                className="flex size-5 translate-x-2/3 translate-y-1/4 items-center justify-center rounded-full border border-container bg-gray-600/10 p-0.5 text-xs text-comment"
                onClick={() => setReplying((prev) => !prev)}
              >
                <ReplyIcon className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {replying && (
        <div className="mt-2">
          <CommentBox
            parentId={entry.parentId ?? entry.id}
            replyingTo={entry.id}
            onSuccess={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}
