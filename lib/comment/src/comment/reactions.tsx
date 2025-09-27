import { useContext, useMemo, useState, useCallback } from "react";
import type { CommentData } from "@repo/api/comment/comment-data";
import {
  addCommentReaction,
  removeCommentReaction,
  type CommentReactionResponse,
} from "@repo/api/comment/reaction";
import { canonicalizeEmoji } from "@repo/api/comment/reaction.model";
import type { GetCommentsResponse } from "@repo/api/comment/get.model";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { produce } from "immer";
import { toast } from "sonner";
import { useAtomValue } from "jotai";
import { sessionOptions, sortByAtom } from "./utils";
import {
  AuthClientRefContext,
  PathnameContext,
  ServerURLContext,
} from "./context";
import { useAnonymousIdentity } from "./anonymous-identity";
import { EmojiPicker } from "frimousse";
import { Popover } from "radix-ui";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import MingcuteAddLine from "~icons/mingcute/add-line";
import type { User } from "@repo/api/auth/client";
import MingcuteEmojiLine from "~icons/mingcute/emoji-line";

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

type RemoveReactionMutationData = {
  anonymousKey?: string;
  emojiRaw: string;
};

type CommentsInfiniteData = InfiniteData<GetCommentsResponse>;

type ReactionUser = CommentData["reactions"][number]["user"];

function isSameReactionUser(left: ReactionUser, right: ReactionUser): boolean {
  switch (left.type) {
    case "user":
      return right.type === "user" && left.id === right.id;
    case "anonymous":
      return right.type === "anonymous" && left.key === right.key;
    default:
      return false;
  }
}

function isReactionFromActor(
  reactionUser: ReactionUser,
  currentUser: User | undefined,
  anonymousKey: string | null | undefined,
): boolean {
  if (reactionUser.type === "user") {
    return Boolean(currentUser && reactionUser.id === currentUser.id);
  }
  if (currentUser) {
    return false;
  }
  if (!anonymousKey) {
    return false;
  }
  return reactionUser.key === anonymousKey;
}

function groupReactions(
  reactions: CommentData["reactions"],
  currentUser: User | undefined,
  anonymousKey: string | null | undefined,
): ReactionGroup[] {
  const map = new Map<string, ReactionGroup>();
  for (const reaction of reactions) {
    const key = reaction.emojiKey;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (
        !existing.reactedBySelf &&
        isReactionFromActor(reaction.user, currentUser, anonymousKey)
      ) {
        existing.reactedBySelf = true;
      }
      continue;
    }
    map.set(key, {
      emojiKey: key,
      emojiRaw: reaction.emojiRaw,
      count: 1,
      reactedBySelf: isReactionFromActor(
        reaction.user,
        currentUser,
        anonymousKey,
      ),
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
  return (
    <button
      type="button"
      className={clsx(
        "flex items-center gap-1 h-7 rounded-md border px-2 py-0.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active
          ? "border-blue-200 bg-blue-100 text-blue-70 dark:border-blue-200/50 dark:bg-blue-100/30 dark:text-blue-300"
          : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
        className,
      )}
      aria-pressed={active}
      {...rest}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-xs leading-none tabular-nums">{count}</span>
    </button>
  );
}

export function CommentReactions({
  commentId,
  reactions,
}: CommentReactionsProps) {
  const serverURL = useContext(ServerURLContext);
  const path = useContext(PathnameContext);
  const authClient = useContext(AuthClientRefContext).current;
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);
  const queryClient = useQueryClient();
  const { anonymousKey, syncFromHeader } = useAnonymousIdentity();
  const [pickerOpen, setPickerOpen] = useState(false);

  const currentUser = session?.user;
  const reactionGroups = groupReactions(reactions, currentUser, anonymousKey);

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
      syncFromHeader(data.anonymousKey);
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
    [setCachedReaction, syncFromHeader],
  );

  const handleRemoveSuccess = useCallback(
    (data: RemoveReactionMutationData) => {
      const emojiKey = canonicalizeEmoji(data.emojiRaw);
      syncFromHeader(data.anonymousKey);
      const removalAnonymousKey = data.anonymousKey ?? anonymousKey ?? null;
      setCachedReaction((comment) => {
        comment.reactions = comment.reactions.filter(
          (reaction) =>
            !(
              reaction.emojiKey === emojiKey &&
              (currentUser
                ? reaction.user.type === "user" &&
                  reaction.user.id === currentUser.id
                : reaction.user.type === "anonymous" &&
                  removalAnonymousKey !== null &&
                  reaction.user.key === removalAnonymousKey)
            ),
        );
      });
    },
    [anonymousKey, currentUser, setCachedReaction, syncFromHeader],
  );

  const addReactionMutation = useMutation<
    AddReactionMutationData,
    Error,
    string
  >({
    mutationFn: async (emojiRaw: string) => {
      const result = await addCommentReaction(
        { commentId, body: { emoji: emojiRaw } },
        serverURL,
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
        serverURL,
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
    <div className="flex flex-wrap items-center gap-1">
      <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={clsx(
              "text-sm inline-flex items-center gap-0.5 text-comment border rounded-md px-2 py-0.5 h-7 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition",
              isBusy && "pointer-events-none opacity-60",
            )}
            aria-label="添加表情"
          >
            <MingcuteEmojiLine className="size-5" />
            <MingcuteAddLine className="size-4" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md"
            collisionPadding={12}
          >
            <EmojiPicker.Root
              onEmojiSelect={({ emoji }) => handleEmojiSelect(emoji)}
              className="isolate flex h-[368px] w-fit flex-col bg-popover rounded-md"
            >
              <div className="flex flex-wrap gap-1 px-2 pt-2">
                {QUICK_ACTION_EMOJIS.map(({ label, emoji }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="flex size-8 items-center justify-center rounded-md text-lg transition hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-700"
                    aria-label={label}
                    title={label}
                  >
                    <span aria-hidden>{emoji}</span>
                    <span className="sr-only">{label}</span>
                  </button>
                ))}
              </div>
              <EmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-200 px-2.5 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:bg-neutral-700" />
              <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
                <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
                  Loading…
                </EmojiPicker.Loading>
                <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-500">
                  No emoji found.
                </EmojiPicker.Empty>
                <EmojiPicker.List
                  className="select-none pb-1.5 w-full"
                  components={{
                    CategoryHeader: ({ category, ...props }) => (
                      <div
                        className="bg-popover px-3 pb-1.5 pt-3 text-xs font-medium text-neutral-600 dark:text-neutral-400"
                        {...props}
                      >
                        {category.label}
                      </div>
                    ),
                    Row: ({ children, ...props }) => (
                      <div className="scroll-my-1.5 px-1.5" {...props}>
                        {children}
                      </div>
                    ),
                    Emoji: ({ emoji, ...props }) => (
                      <button
                        className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-neutral-200 dark:data-[active]:bg-neutral-700"
                        {...props}
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
