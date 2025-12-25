import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import CommentIcon from "~icons/mingcute/comment-line";
import type { CommentData } from "@repo/api/comment/comment-data";
import { AutoResizeHeight } from "@/components/transitions/auto-resize-height";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient } from "@/lib/hooks/context";
import { cn } from "@/lib/utils";
import { CommentBoxNew } from "../box";
import { CommentBoxEdit } from "../box/edit-comment";
import { CommentReactions } from "../reactions";
import { formatRelativeTime } from "../utils/format-time";
import { CommentDropdown } from "./comment-dropdown";

interface CommentItemProps {
  comment: CommentData;
  replyToName?: string;
}

/**
 * Renders a single comment with user info, content, reactions, and actions.
 */
export function CommentItem({ comment, replyToName }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));

  const isMine =
    session && comment.userId && comment.userId === session.user.id;

  return (
    <div id={`comment-${comment.id}`}>
      <div className="flex items-start gap-3 border-zinc-100 py-2 last:border-b-0">
        {/* Avatar */}
        <div className="shrink-0">
          <img
            src={comment.userImage}
            alt={comment.displayName}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://avatar.vercel.sh/anonymous`;
            }}
          />
        </div>

        {/* Content */}
        <div className="group mt-0.5 mb-1 flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm text-content/80">
              {comment.displayName}
            </span>

            {isMine && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600 dark:bg-blue-800/60 dark:text-blue-100">
                我
              </span>
            )}
            {session?.user.role === "admin" && comment.isSpam === true && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-800/60 dark:text-red-100">
                垃圾评论
              </span>
            )}
            <span
              className="text-xs text-zinc-500"
              title={new Date(comment.createdAt).toLocaleString("zh-CN")}
            >
              {formatRelativeTime(new Date(comment.createdAt))}
            </span>
          </div>

          {editing && session ? (
            <CommentBoxEdit
              editId={comment.id}
              onCancel={() => setEditing(false)}
              onSuccess={() => setEditing(false)}
              initialContent={comment.rawContent}
            />
          ) : (
            <div className="">
              {replyToName && (
                <a
                  className="py-1 text-xs text-zinc-500"
                  href={`#comment-${comment.replyToId}`}
                >
                  <span className="text-zinc-500">回复 </span>
                  {replyToName}:
                </a>
              )}
              <div
                className="prose prose-sm wrap-break-word text-content dark:prose-invert prose-p:my-1"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            </div>
          )}

          <div
            className={cn(
              "mt-1 flex items-center",
              comment.reactions.length > 0 ? "gap-4" : "gap-2",
            )}
          >
            <CommentReactions
              commentId={comment.id}
              reactions={comment.reactions}
            />
            <button
              onClick={() => setReplying(!replying)}
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-sm text-comment transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <CommentIcon /> 回复
            </button>
            <CommentDropdown
              comment={comment}
              onEdit={() => setEditing(true)}
            />
          </div>
        </div>
      </div>

      {/* Reply form */}
      <AutoResizeHeight duration={0.1}>
        <AnimatePresence initial={false}>
          {replying && (
            <motion.div
              className="ml-8 p-0.5 pt-2"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                filter: "blur(4px)",
                transition: { duration: 0.15 },
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <CommentBoxNew
                reply={{
                  parentId: comment.parentId ? comment.parentId : comment.id,
                  replyToId: comment.id,
                  at: comment.displayName,
                  onCancel: () => setReplying(false),
                }}
                onSuccess={() => setReplying(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </AutoResizeHeight>
    </div>
  );
}
