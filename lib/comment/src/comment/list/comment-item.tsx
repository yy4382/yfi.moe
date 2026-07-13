import { AutoResizeHeight } from "#/components/transitions/auto-resize-height";
import { MaskIcon } from "#/components/ui/mask-icon";
import { sessionOptions } from "#/lib/auth/session-options";
import { useAuthClient } from "#/lib/hooks/context";
import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CommentData } from "@repo/api/comment/comment-data";
import {
  colors,
  motion as motionTokens,
  radii,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import { CommentBoxNew } from "../box";
import { CommentBoxEdit } from "../box/edit-comment";
import { CommentReactions } from "../reactions";
import { formatRelativeTime } from "../utils/format-time";
import { CommentDropdown } from "./comment-dropdown";

interface CommentItemProps {
  comment: CommentData;
  replyToName?: string;
}

export function CommentItem({ comment, replyToName }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));

  return (
    <article
      id={`comment-${comment.id}`}
      aria-label={`${comment.displayName}：${comment.rawContent}`}
    >
      <div {...stylex.props(styles.row)}>
        <img
          src={comment.userImage}
          alt={comment.displayName}
          width={36}
          height={36}
          {...stylex.props(styles.avatar)}
          onError={(event) => {
            event.currentTarget.src = "https://avatar.vercel.sh/anonymous";
          }}
        />

        <div {...stylex.props(styles.content)}>
          <div {...stylex.props(styles.meta)}>
            <span {...stylex.props(styles.name)}>{comment.displayName}</span>
            {comment.ownedByViewer && (
              <span {...stylex.props(styles.badge, styles.mineBadge)}>我</span>
            )}
            {session?.user.role === "admin" && comment.isSpam === true && (
              <span {...stylex.props(styles.badge, styles.spamBadge)}>
                垃圾评论
              </span>
            )}
            <time
              {...stylex.props(styles.time)}
              dateTime={new Date(comment.createdAt).toISOString()}
              title={new Date(comment.createdAt).toLocaleString("zh-CN")}
            >
              {formatRelativeTime(new Date(comment.createdAt))}
            </time>
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
                  回复 {replyToName}:
                </a>
              )}
              <div
                className="comment-prose"
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
              type="button"
              onClick={() => setReplying((current) => !current)}
              {...stylex.props(styles.replyButton)}
            >
              <MaskIcon name="comment-line" />
              回复
            </button>
            <CommentDropdown
              comment={comment}
              onEdit={() => setEditing(true)}
            />
          </div>
        </div>
      </div>

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
                  parentId: comment.parentId ?? comment.id,
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

const styles = stylex.create({
  row: {
    alignItems: "flex-start",
    display: "flex",
    gap: spacing.md,
    paddingBlock: spacing.sm,
  },
  avatar: {
    borderRadius: radii.round,
    flexShrink: 0,
    height: "2.25rem",
    objectFit: "cover",
    width: "2.25rem",
  },
  content: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    marginBlock: "0.125rem 0.25rem",
    minWidth: 0,
  },
  meta: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: { color: colors.textPrimary, fontSize: typography.sizeSm },
  badge: {
    borderRadius: radii.sm,
    fontSize: typography.sizeXs,
    paddingBlock: spacing.xxs,
    paddingInline: "0.375rem",
  },
  mineBadge: {
    backgroundColor: colors.surfaceInteractive,
    color: colors.accentText,
  },
  spamBadge: {
    backgroundColor: colors.dangerSurface,
    color: colors.dangerText,
  },
  time: { color: colors.textMuted, fontSize: typography.sizeXs },
  replyTo: {
    color: colors.textMuted,
    display: "inline-block",
    fontSize: typography.sizeXs,
    paddingBlock: spacing.xs,
    textDecoration: "none",
  },
  actions: { alignItems: "center", display: "flex", marginTop: spacing.xs },
  actionsWithReactions: { gap: spacing.lg },
  actionsWithoutReactions: { gap: spacing.sm },
  replyButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceInteractive,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors.textSecondary,
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: typography.sizeSm,
    gap: spacing.xs,
    height: "1.75rem",
    paddingBlock: spacing.xxs,
    paddingInline: spacing.sm,
    transitionDuration: motionTokens.durationFast,
    transitionProperty: "background-color",
    ":hover": { backgroundColor: colors.surfaceInteractiveHover },
  },
  replyForm: {
    marginInlineStart: spacing.xxl,
    padding: "0.125rem",
    paddingTop: spacing.sm,
  },
});
