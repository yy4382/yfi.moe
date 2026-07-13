import { MaskIcon } from "#/components/ui/mask-icon";
import {
  addCommentReaction,
  removeCommentReaction,
  type CommentReactionRemoveResponse,
  type CommentReactionResponse,
} from "#/lib/api/comment/reaction";
import { sessionOptions } from "#/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "#/lib/hooks/context";
import { useGuestIdentity } from "#/lib/hooks/guest-identity";
import * as stylex from "@stylexjs/stylex";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { EmojiPicker } from "frimousse";
import { produce } from "immer";
import { useAtomValue } from "jotai";
import { Popover } from "radix-ui";
import { useMemo, useState, useCallback, type ComponentProps } from "react";
import type { ButtonHTMLAttributes } from "react";
import { toast } from "sonner";
import type { CommentData } from "@repo/api/comment/comment-data";
import type { GetCommentsResponse } from "@repo/api/comment/get.model";
import { canonicalizeEmoji } from "@repo/api/comment/reaction.model";
import {
  colors,
  motion,
  radii,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import type { PublicOwner } from "@repo/guest-identity";
import { sortByAtom } from "./atoms";

type ReactionGroup = {
  emojiKey: string;
  emojiRaw: string;
  count: number;
  reactedBySelf: boolean;
};

// from GitHub's quick reaction set
const QUICK_ACTION_EMOJIS = [
  { label: "thumbs up", emoji: "👍" },
  { label: "thumbs down", emoji: "👎" },
  { label: "laugh", emoji: "😄" },
  { label: "confused", emoji: "😕" },
  { label: "heart", emoji: "❤️" },
  { label: "hooray", emoji: "🎉" },
  { label: "rocket", emoji: "🚀" },
  { label: "eyes", emoji: "👀" },
] as const;

type CommentReactionsProps = {
  commentId: number;
  reactions: CommentData["reactions"];
};

type AddReactionMutationData = CommentReactionResponse & {
  emojiRaw: string;
};

type RemoveReactionMutationData = CommentReactionRemoveResponse & {
  emojiRaw: string;
};

type CommentsInfiniteData = InfiniteData<GetCommentsResponse>;

type ReactionUser = CommentData["reactions"][number]["user"];

function isSameReactionUser(left: ReactionUser, right: ReactionUser): boolean {
  switch (left.type) {
    case "user":
      return right.type === "user" && left.id === right.id;
    case "guest":
      return right.type === "guest" && left.key === right.key;
    default:
      return false;
  }
}

const toPublicOwner = (reactionUser: ReactionUser): PublicOwner =>
  reactionUser.type === "user"
    ? { type: "user", id: reactionUser.id }
    : { type: "guest", key: reactionUser.key };

function groupReactions(
  reactions: CommentData["reactions"],
  isOwnedByViewer: (reactionUser: ReactionUser) => boolean,
): ReactionGroup[] {
  const map = new Map<string, ReactionGroup>();
  for (const reaction of reactions) {
    const key = reaction.emojiKey;
    const isOwned = isOwnedByViewer(reaction.user);
    const existing = map.get(key);
    if (existing) {
      if (!(existing.reactedBySelf && isOwned)) {
        existing.count += 1;
      }
      existing.reactedBySelf ||= isOwned;
      continue;
    }
    map.set(key, {
      emojiKey: key,
      emojiRaw: reaction.emojiRaw,
      count: 1,
      reactedBySelf: isOwned,
    });
  }
  return Array.from(map.values());
}

function updateCommentReactions(
  data: CommentsInfiniteData,
  commentId: number,
  updater: (comment: CommentData) => void,
): CommentsInfiniteData {
  return produce(data, (draft) => {
    let updated = false;
    for (const page of draft.pages) {
      for (const comment of page.comments) {
        if (comment.data.id === commentId) {
          updater(comment.data);
          updated = true;
          break;
        }
        const child = comment.children.data.find((c) => c.id === commentId);
        if (child) {
          updater(child);
          updated = true;
          break;
        }
      }
      if (updated) {
        break;
      }
    }
  });
}

function ReactionChip(
  props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    active?: boolean;
    count: number;
    emoji: string;
  },
) {
  const { active, count, emoji, ...rest } = props;
  return (
    <button
      type="button"
      {...stylex.props(
        styles.chip,
        active ? styles.chipActive : styles.chipIdle,
      )}
      aria-pressed={active}
      {...rest}
    >
      <span {...stylex.props(styles.emoji)}>{emoji}</span>
      <span {...stylex.props(styles.count)}>{count}</span>
    </button>
  );
}

export function CommentReactions({
  commentId,
  reactions,
}: CommentReactionsProps) {
  const path = usePathname();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);
  const queryClient = useQueryClient();
  const { owns, synchronize } = useGuestIdentity();
  const [pickerOpen, setPickerOpen] = useState(false);

  const currentUser = session?.user;
  const isOwnedByViewer = useCallback(
    (reactionUser: ReactionUser) =>
      owns(toPublicOwner(reactionUser), currentUser?.id),
    [currentUser?.id, owns],
  );
  const reactionGroups = groupReactions(reactions, isOwnedByViewer);

  const queryKey = useMemo(
    () => ["comments", { session: currentUser?.id }, path, sortBy] as const,
    [currentUser?.id, path, sortBy],
  );

  const setCachedReaction = useCallback(
    (updater: (comment: CommentData) => void) => {
      queryClient.setQueryData<CommentsInfiniteData>(queryKey, (prev) => {
        if (!prev) {
          return prev;
        }
        return updateCommentReactions(prev, commentId, updater);
      });
    },
    [queryClient, queryKey, commentId],
  );

  const invalidateCommentsQuery = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const handleAddSuccess = useCallback(
    (data: AddReactionMutationData) => {
      const { reaction: nextReaction } = data;
      synchronize(data.identityHeaders);
      setCachedReaction((comment) => {
        comment.reactions = comment.reactions.filter(
          (reaction) =>
            !(
              reaction.emojiKey === nextReaction.emojiKey &&
              isSameReactionUser(reaction.user, nextReaction.user)
            ),
        );
        comment.reactions.push(nextReaction);
      });
    },
    [setCachedReaction, synchronize],
  );

  const handleRemoveSuccess = useCallback(
    (data: RemoveReactionMutationData) => {
      const emojiKey = canonicalizeEmoji(data.emojiRaw);
      synchronize(data.identityHeaders);
      setCachedReaction((comment) => {
        comment.reactions = comment.reactions.filter(
          (reaction) =>
            !(reaction.emojiKey === emojiKey && isOwnedByViewer(reaction.user)),
        );
      });
    },
    [isOwnedByViewer, setCachedReaction, synchronize],
  );

  const honoClient = useHonoClient();

  const addReactionMutation = useMutation<
    AddReactionMutationData,
    Error,
    string
  >({
    mutationFn: async (emojiRaw: string) => {
      const result = await addCommentReaction(
        { commentId, body: { emoji: emojiRaw } },
        honoClient,
      );
      if (result._tag === "err") {
        throw new Error(result.error);
      }
      return { ...result.value, emojiRaw } satisfies AddReactionMutationData;
    },
    onSuccess: handleAddSuccess,
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setPickerOpen(false);
      void invalidateCommentsQuery();
    },
  });

  const removeReactionMutation = useMutation<
    RemoveReactionMutationData,
    Error,
    string
  >({
    mutationFn: async (emojiRaw: string) => {
      const result = await removeCommentReaction(
        { commentId, body: { emoji: emojiRaw } },
        honoClient,
      );
      if (result._tag === "err") {
        throw new Error(result.error);
      }
      return { ...result.value, emojiRaw } satisfies RemoveReactionMutationData;
    },
    onSuccess: handleRemoveSuccess,
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      void invalidateCommentsQuery();
    },
  });

  const handleChipClick = useCallback(
    (group: ReactionGroup) => {
      if (group.reactedBySelf) {
        removeReactionMutation.mutate(group.emojiRaw);
      } else {
        addReactionMutation.mutate(group.emojiRaw);
      }
    },
    [addReactionMutation, removeReactionMutation],
  );

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      addReactionMutation.mutate(emoji);
    },
    [addReactionMutation],
  );

  const isBusy =
    addReactionMutation.isPending || removeReactionMutation.isPending;

  return (
    <div {...stylex.props(styles.root)}>
      <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            {...stylex.props(styles.addButton, isBusy && styles.busy)}
            aria-label="添加表情"
          >
            <MaskIcon name="emoji-line" stylexStyle={styles.emojiIcon} />
            <MaskIcon name="add-line" stylexStyle={styles.addIcon} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            {...stylex.props(styles.popover)}
            collisionPadding={12}
          >
            <EmojiPicker.Root
              onEmojiSelect={({ emoji }) => handleEmojiSelect(emoji)}
              {...stylex.props(styles.picker)}
            >
              <div {...stylex.props(styles.quickActions)}>
                {QUICK_ACTION_EMOJIS.map(({ label, emoji }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    {...stylex.props(styles.quickButton)}
                    aria-label={label}
                    title={label}
                  >
                    <span aria-hidden>{emoji}</span>
                    <span {...stylex.props(styles.srOnly)}>{label}</span>
                  </button>
                ))}
              </div>
              <EmojiPicker.Search {...stylex.props(styles.search)} />
              <EmojiPicker.Viewport {...stylex.props(styles.viewport)}>
                <EmojiPicker.Loading {...stylex.props(styles.pickerStatus)}>
                  Loading…
                </EmojiPicker.Loading>
                <EmojiPicker.Empty {...stylex.props(styles.pickerStatus)}>
                  No emoji found.
                </EmojiPicker.Empty>
                <EmojiPicker.List
                  {...stylex.props(styles.pickerList)}
                  components={pickerComponents}
                />
              </EmojiPicker.Viewport>
            </EmojiPicker.Root>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {reactionGroups.map((group) => (
        <ReactionChip
          key={group.emojiKey}
          emoji={group.emojiRaw}
          count={group.count}
          active={group.reactedBySelf}
          onClick={() => handleChipClick(group)}
          disabled={isBusy}
        />
      ))}
    </div>
  );
}

const popoverIn = stylex.keyframes({
  from: { opacity: 0, transform: "scale(0.96) translateY(-0.25rem)" },
  to: { opacity: 1, transform: "scale(1) translateY(0)" },
});
const popoverOut = stylex.keyframes({
  from: { opacity: 1, transform: "scale(1) translateY(0)" },
  to: { opacity: 0, transform: "scale(0.96) translateY(-0.25rem)" },
});

const styles = stylex.create({
  root: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    alignItems: "center",
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    cursor: "pointer",
    display: "flex",
    fontSize: typography.sizeSm,
    gap: spacing.xs,
    height: "1.75rem",
    paddingBlock: spacing.xxs,
    paddingInline: spacing.sm,
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color, border-color, color, opacity",
    ":focus-visible": {
      outlineColor: colors.focusRing,
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    ":disabled": { cursor: "not-allowed", opacity: 0.6 },
  },
  chipActive: {
    backgroundColor: colors.surfaceInteractiveHover,
    borderColor: colors.focusRing,
    color: colors.accentText,
  },
  chipIdle: {
    backgroundColor: colors.surfaceInteractive,
    borderColor: colors.borderDefault,
    color: colors.textSecondary,
    ":hover": { backgroundColor: colors.surfaceInteractiveHover },
  },
  emoji: { fontSize: typography.sizeMd, lineHeight: 1 },
  count: {
    fontSize: typography.sizeXs,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceInteractive,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors.textSecondary,
    cursor: "pointer",
    display: "inline-flex",
    gap: spacing.xxs,
    height: "1.75rem",
    paddingBlock: spacing.xxs,
    paddingInline: spacing.sm,
    transitionDuration: motion.durationFast,
    ":hover": { backgroundColor: colors.surfaceInteractiveHover },
  },
  busy: { opacity: 0.6, pointerEvents: "none" },
  emojiIcon: { height: "1.25rem", width: "1.25rem" },
  addIcon: { height: "1rem", width: "1rem" },
  popover: {
    animationDuration: motion.durationFast,
    animationFillMode: "both",
    backgroundColor: colors.surfaceOverlay,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.md,
    color: colors.textPrimary,
    maxHeight: "var(--radix-popover-content-available-height)",
    minWidth: "8rem",
    overflow: "hidden auto",
    padding: spacing.xs,
    transformOrigin: "var(--radix-popover-content-transform-origin)",
    zIndex: 50,
    ":is([data-state='open'])": { animationName: popoverIn },
    ":is([data-state='closed'])": { animationName: popoverOut },
  },
  picker: {
    backgroundColor: colors.surfaceOverlay,
    borderRadius: radii.md,
    display: "flex",
    flexDirection: "column",
    height: "23rem",
    isolation: "isolate",
    width: "fit-content",
  },
  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingInline: spacing.sm,
    paddingTop: spacing.sm,
  },
  quickButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    border: 0,
    borderRadius: radii.md,
    cursor: "pointer",
    display: "flex",
    fontSize: typography.sizeLg,
    height: "2rem",
    justifyContent: "center",
    outline: "none",
    transitionDuration: motion.durationFast,
    width: "2rem",
    ":hover": { backgroundColor: colors.surfaceInteractiveHover },
    ":focus-visible": {
      outlineColor: colors.focusRing,
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  },
  search: {
    appearance: "none",
    backgroundColor: colors.surfaceMuted,
    border: 0,
    borderRadius: radii.md,
    color: colors.textPrimary,
    fontSize: typography.sizeSm,
    marginInline: spacing.sm,
    marginTop: spacing.sm,
    outline: "none",
    paddingBlock: spacing.sm,
    paddingInline: "0.625rem",
    zIndex: 10,
    ":focus-visible": {
      outlineColor: colors.focusRing,
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  },
  viewport: { flex: 1, outline: "none", position: "relative" },
  pickerStatus: {
    alignItems: "center",
    color: colors.textMuted,
    display: "flex",
    fontSize: typography.sizeSm,
    inset: 0,
    justifyContent: "center",
    position: "absolute",
  },
  pickerList: { paddingBottom: "0.375rem", userSelect: "none", width: "100%" },
  categoryHeader: {
    backgroundColor: colors.surfaceOverlay,
    color: colors.textSecondary,
    fontSize: typography.sizeXs,
    fontWeight: typography.weightMedium,
    paddingBottom: "0.375rem",
    paddingInline: spacing.md,
    paddingTop: spacing.md,
  },
  pickerRow: { paddingInline: "0.375rem", scrollMarginBlock: "0.375rem" },
  pickerEmoji: {
    alignItems: "center",
    backgroundColor: "transparent",
    border: 0,
    borderRadius: radii.md,
    cursor: "pointer",
    display: "flex",
    fontSize: typography.sizeLg,
    height: "2rem",
    justifyContent: "center",
    width: "2rem",
    ":is([data-active='true'])": {
      backgroundColor: colors.surfaceInteractiveHover,
    },
  },
  srOnly: {
    clipPath: "inset(50%)",
    height: "1px",
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  },
});

const pickerComponents: ComponentProps<typeof EmojiPicker.List>["components"] =
  {
    CategoryHeader: ({ category, ...props }) => (
      <div {...stylex.props(styles.categoryHeader)} {...props}>
        {category.label}
      </div>
    ),
    Row: ({ children, ...props }) => (
      <div {...stylex.props(styles.pickerRow)} {...props}>
        {children}
      </div>
    ),
    Emoji: ({ emoji, ...props }) => (
      <button {...stylex.props(styles.pickerEmoji)} {...props}>
        {emoji.emoji}
      </button>
    ),
  };
