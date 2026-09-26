import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import CommentIcon from "~icons/mingcute/comment-line";
import type { CommentData } from "@repo/api/comment/comment-data";
import { AutoResizeHeight } from "@/components/transitions/auto-resize-height";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient } from "@/lib/hooks/context";
import { CommentBoxNew } from "../box";
import { CommentBoxEdit } from "../box/edit-comment";
import { CommentReactions } from "../reactions";
import { formatRelativeTime } from "../utils/format-time";
import { CommentDropdown } from "./comment-dropdown";
import { styles } from "./comment-item.stylex";

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

  const isMine = comment.ownedByViewer;

  return (
    <article
      id={`comment-${comment.id}`}
      aria-label={`${comment.displayName}：${comment.rawContent}`}
    >
      <div {...stylex.props(styles.row)}>
        {/* Avatar */}
        <div {...stylex.props(styles.avatarContainer)}>
          <img
            src={comment.userImage}
            alt={comment.displayName}
            width={36}
            height={36}
            {...stylex.props(styles.avatar)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://avatar.vercel.sh/anonymous`;
            }}
          />
        </div>

        {/* Content */}
        <div {...stylex.props(styles.content)}>
          <div {...stylex.props(styles.header)}>
            <span {...stylex.props(styles.displayName)}>
              {comment.displayName}
            </span>

            {isMine && (
              <span {...stylex.props(styles.badge, styles.mineBadge)}>我</span>
            )}
            {session?.user.role === "admin" && comment.isSpam === true && (
              <span {...stylex.props(styles.badge, styles.spamBadge)}>
                垃圾评论
              </span>
            )}
            <span
              {...stylex.props(styles.timestamp)}
              title={new Date(comment.createdAt).toLocaleString("zh-CN")}
            >
              {formatRelativeTime(new Date(comment.createdAt))}
            </span>
          </div>

          {editing ? (
            <CommentBoxEdit
              editId={comment.id}
              onCancel={() => setEditing(false)}
              onSuccess={() => setEditing(false)}
              initialContent={comment.rawContent}
            />
          ) : (
            <div>
              {replyToName && (
                <a
                  {...stylex.props(styles.replyTo)}
                  href={`#comment-${comment.replyToId}`}
                >
                  <span {...stylex.props(styles.muted)}>回复 </span>
                  {replyToName}:
                </a>
              )}
              <div
                className={`prose prose-sm prose-theme comment-prose ${stylex.props(styles.prose).className}`}
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            </div>
          )}

          <div
            {...stylex.props(
              styles.actions,
              comment.reactions.length > 0
                ? styles.actionsWithReactions
                : styles.actionsWithoutReactions,
            )}
          >
            <CommentReactions
              commentId={comment.id}
              reactions={comment.reactions}
            />
            <button
              onClick={() => setReplying(!replying)}
              {...stylex.props(styles.replyButton)}
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
              {...stylex.props(styles.replyForm)}
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
    </article>
  );
}
