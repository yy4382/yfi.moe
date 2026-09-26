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
import { useMemo, useState, useCallback } from "react";
import type { ButtonHTMLAttributes } from "react";
import { toast } from "sonner";
import MingcuteAddLine from "~icons/mingcute/add-line";
import MingcuteEmojiLine from "~icons/mingcute/emoji-line";
import type { CommentData } from "@repo/api/comment/comment-data";
import type { GetCommentsResponse } from "@repo/api/comment/get.model";
import { canonicalizeEmoji } from "@repo/api/comment/reaction.model";
import type { PublicOwner } from "@repo/guest-identity";
import {
  addCommentReaction,
  removeCommentReaction,
  type CommentReactionRemoveResponse,
  type CommentReactionResponse,
} from "@/lib/api/comment/reaction";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { useGuestIdentity } from "@/lib/hooks/guest-identity";
import { sortByAtom } from "./atoms";
import "./reactions.css";
import { styles } from "./reactions.stylex";

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
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    count: number;
    emoji: string;
  },
) {
  const { active, count, emoji, className, ...rest } = props;
  const chipProps = stylex.props(
    styles.chip,
    active ? styles.activeChip : styles.inactiveChip,
  );
  return (
    <button
      type="button"
      {...chipProps}
      className={`${chipProps.className}${className ? ` ${className}` : ""}`}
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
            <MingcuteEmojiLine {...stylex.props(styles.emojiIcon)} />
            <MingcuteAddLine {...stylex.props(styles.addIcon)} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className={`comment-reaction-popover ${stylex.props(styles.popover).className}`}
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
                    {...stylex.props(styles.quickAction)}
                    aria-label={label}
                    title={label}
                  >
                    <span aria-hidden>{emoji}</span>
                    <span {...stylex.props(styles.visuallyHidden)}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
              <EmojiPicker.Search {...stylex.props(styles.search)} />
              <EmojiPicker.Viewport {...stylex.props(styles.viewport)}>
                <EmojiPicker.Loading {...stylex.props(styles.pickerState)}>
                  Loading…
                </EmojiPicker.Loading>
                <EmojiPicker.Empty {...stylex.props(styles.pickerState)}>
                  No emoji found.
                </EmojiPicker.Empty>
                <EmojiPicker.List
                  {...stylex.props(styles.list)}
                  components={{
                    CategoryHeader: ({ category, className, ...props }) => (
                      <div
                        {...props}
                        className={`${stylex.props(styles.category).className}${className ? ` ${className}` : ""}`}
                      >
                        {category.label}
                      </div>
                    ),
                    Row: ({ children, className, ...props }) => (
                      <div
                        {...props}
                        className={`${stylex.props(styles.row).className}${className ? ` ${className}` : ""}`}
                      >
                        {children}
                      </div>
                    ),
                    Emoji: ({ emoji, className, ...props }) => (
                      <button
                        {...props}
                        className={`${stylex.props(styles.pickerEmoji).className}${className ? ` ${className}` : ""}`}
                      >
                        {emoji.emoji}
                      </button>
                    ),
                  }}
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
