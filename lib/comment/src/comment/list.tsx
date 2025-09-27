import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import clsx from "clsx";
import { produce } from "immer";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { Fragment, useContext, useState } from "react";
import { toast } from "sonner";
import { z, ZodError } from "zod";
import CommentIcon from "~icons/mingcute/comment-line";
import MingcuteDelete3Line from "~icons/mingcute/delete-3-line";
import MingcuteEditLine from "~icons/mingcute/edit-line";
import MingcuteLoadingLine from "~icons/mingcute/loading-line";
import MoreIcon from "~icons/mingcute/more-1-line";
import MingcuteShieldShapeLine from "~icons/mingcute/shield-shape-line";
import type { User } from "@repo/api/auth/client";
import type { CommentData } from "@repo/api/comment/comment-data";
import { deleteComment } from "@repo/api/comment/delete";
import { getComments, getCommentsChildren } from "@repo/api/comment/get";
import type { LayeredCommentData } from "@repo/api/comment/get.model";
import { toggleCommentSpam } from "@repo/api/comment/toggle-spam";
import { AutoResizeHeight } from "@/components/transitions/auto-resize-height";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CommentBoxNew } from "./box/add-comment";
import { CommentBoxEdit } from "./box/edit-comment";
import {
  AuthClientRefContext,
  PathnameContext,
  ServerURLContext,
} from "./context";
import { CommentReactions } from "./reactions";
import {
  sessionOptions,
  SORT_BY_LABELS,
  SORT_BY_OPTIONS,
  sortByAtom,
} from "./utils";

const PER_PAGE = 10;

function listOptions(
  user: User | undefined,
  path: string,
  sortBy: (typeof SORT_BY_OPTIONS)[number],
  serverURL: string,
) {
  return infiniteQueryOptions({
    queryKey: ["comments", { session: user?.id }, path, sortBy],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      let result;
      try {
        result = await getComments(
          {
            path,
            limit: PER_PAGE,
            cursor: pageParam,
            sortBy,
          },
          serverURL,
        );
      } catch {
        throw new Error("网络请求失败");
      }
      if (result._tag === "err") {
        throw new Error("服务器错误");
      }
      return result.value;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.cursor : undefined;
    },
    placeholderData: (previousData, previousQuery) => {
      if (previousQuery?.queryKey[3] === sortBy) {
        return previousData;
      }
      if (!previousData) {
        return previousData;
      }
      return produce(previousData, (draft) => {
        draft.pages.reverse();
        draft.pages.forEach((page) => page.comments.reverse());
      });
    },
  });
}

export function CommentList() {
  const path = useContext(PathnameContext);
  const serverURL = useContext(ServerURLContext);
  const authClient = useContext(AuthClientRefContext).current;
  const { data: session } = useQuery(sessionOptions(authClient));
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const {
    data,
    fetchNextPage,
    isPending,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery(listOptions(session?.user, path, sortBy, serverURL));

  if (isPending) {
    return (
      <div className="mt-6 p-4 text-center text-zinc-500">加载评论中...</div>
    );
  }
  if (isError) {
    return (
      <div className="justify-center-safe mt-6 flex items-center gap-2 p-4 text-center text-red-500">
        加载评论失败:{" "}
        {error instanceof ZodError ? z.prettifyError(error) : error.message}
        <button
          onClick={() => void refetch()}
          className="border-container text-comment rounded-md border px-2 py-1 shadow-md hover:scale-105 active:scale-95"
        >
          重试
        </button>
      </div>
    );
  }
  if (
    !data ||
    data.pages.length === 0 ||
    data.pages[0]!.comments.length === 0
  ) {
    return <div className="mt-6 p-4 text-center text-zinc-500">暂无留言</div>;
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="text-comment flex items-center gap-2">
          <span>共{data.pages[0]!.total}条留言</span>
          {(isFetching || isFetchingNextPage) && (
            <span>
              <MingcuteLoadingLine className="size-6 animate-spin" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {SORT_BY_OPTIONS.map((sortByOption) => (
            <button
              key={sortByOption}
              onClick={() => setSortBy(sortByOption)}
              className={clsx(
                "text-accent-foreground py-1 text-sm hover:scale-105 active:scale-95",
                sortBy !== sortByOption && "text-muted-foreground",
              )}
            >
              {SORT_BY_LABELS[sortByOption]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {data.pages
          .map((page) => page.comments)
          .flat()
          .map((comment) => (
            <Fragment key={comment.data.id}>
              <CommentParent parentComment={comment} />
            </Fragment>
          ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => void fetchNextPage()}
            disabled={isFetching}
            className="border-container text-comment rounded-md border px-2 py-1 shadow-md hover:scale-105 active:scale-95"
          >
            {isFetchingNextPage ? "正在加载..." : "加载更多"}
          </button>
        </div>
      )}
      <div className="mt-6 text-center text-zinc-500">
        {isFetching && !isFetchingNextPage ? "加载中..." : null}
      </div>
    </div>
  );
}

export function CommentParent({
  parentComment,
}: {
  parentComment: LayeredCommentData;
}) {
  const path = useContext(PathnameContext);
  const serverURL = useContext(ServerURLContext);
  const authClient = useContext(AuthClientRefContext).current;
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);

  const {
    data: childrenData,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "comments",
      { session: session?.user.id },
      path,
      sortBy,
      parentComment.data.id,
    ],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      let result;
      try {
        result = await getCommentsChildren(
          {
            path,
            limit: PER_PAGE,
            cursor: pageParam,
            sortBy: "created_asc",
            rootId: parentComment.data.id,
          },
          serverURL,
        );
      } catch {
        throw new Error("网络请求失败");
      }
      if (result._tag === "err") {
        throw new Error("服务器错误");
      }
      return result.value;
    },
    enabled: parentComment.children.hasMore,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.cursor : undefined;
    },
    initialData: {
      pages: [parentComment.children],
      pageParams: [undefined],
    },
    staleTime: 1000,
  });

  return (
    <div className="flex flex-col">
      <CommentItem comment={parentComment.data} />
      {parentComment.children.total > 0 && (
        <div className="ml-6 pl-4">
          {childrenData.pages
            .map((page) => page.data)
            .flat()
            .map((children) => {
              const replyToName =
                children.replyToId === parentComment.data.id
                  ? parentComment.data.displayName
                  : parentComment.children.data.find(
                      (c) => c.id === children.replyToId,
                    )?.displayName;
              return (
                <CommentItem
                  key={children.id}
                  comment={children}
                  replyToName={replyToName}
                />
              );
            })}
          {hasNextPage && (
            <div className="flex justify-center">
              <button
                onClick={() => void fetchNextPage()}
                className="border-container text-comment rounded-md border px-2 py-1 shadow-md hover:scale-105 active:scale-95"
              >
                加载更多回复
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type CommentItemProps = {
  comment: CommentData;
  replyToName?: string;
};
export function CommentItem({ comment: entry, replyToName }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const authClient = useContext(AuthClientRefContext).current;
  const { data: session } = useQuery(sessionOptions(authClient));

  const isMine = session && entry.userId && entry.userId === session.user.id;

  return (
    <div id={`comment-${entry.id}`}>
      <div className="flex items-start gap-3 border-zinc-100 py-2 last:border-b-0">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          <img
            src={entry.userImage}
            alt={entry.displayName}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
            onError={(e) => {
              // 如果头像加载失败，使用默认头像
              const target = e.target as HTMLImageElement;
              target.src = `https://avatar.vercel.sh/anonymous`;
            }}
          />
        </div>

        {/* 评论内容区域 */}
        <div className="group mb-1 mt-0.5 flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-content/80 text-sm">{entry.displayName}</span>

            {isMine && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600 dark:bg-blue-800/60 dark:text-blue-100">
                我
              </span>
            )}
            {session?.user.role === "admin" && entry.isSpam === true && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-800/60 dark:text-red-100">
                垃圾评论
              </span>
            )}
            <span
              className="text-xs text-zinc-500"
              title={new Date(entry.createdAt).toLocaleString("zh-CN")}
            >
              {formatTime(new Date(entry.createdAt))}
            </span>
          </div>

          {editing && session ? (
            <CommentBoxEdit
              editId={entry.id}
              onCancel={() => setEditing(false)}
              onSuccess={() => setEditing(false)}
              initialContent={entry.rawContent}
            />
          ) : (
            <div className="">
              {/* 评论内容 */}
              {replyToName && (
                <a
                  className="py-1 text-xs text-zinc-500"
                  href={`#comment-${entry.replyToId}`}
                >
                  <span className="text-zinc-500">回复 </span>
                  {replyToName}:
                </a>
              )}
              <div
                className="prose prose-sm dark:prose-invert prose-p:my-1 text-content break-words"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            </div>
          )}
          <div
            className={cn(
              "mt-1 flex items-center",
              entry.reactions.length > 0 ? "gap-4" : "gap-2",
            )}
          >
            <CommentReactions
              commentId={entry.id}
              reactions={entry.reactions}
            />
            <button
              onClick={() => setReplying(!replying)}
              className="text-comment inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <CommentIcon /> 回复
            </button>
            <CommentItemDropdown
              entry={entry}
              onEdit={() => setEditing(true)}
            />
          </div>
        </div>
      </div>
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
                  parentId: entry.parentId ? entry.parentId : entry.id,
                  replyToId: entry.id,
                  at: entry.displayName,
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

function CommentItemDropdown({
  entry,
  onEdit,
}: {
  entry: CommentData;
  onEdit: () => void;
}) {
  const path = useContext(PathnameContext);
  const serverURL = useContext(ServerURLContext);
  const queryClient = useQueryClient();
  const authClient = useContext(AuthClientRefContext).current;
  const { data: session } = useQuery(sessionOptions(authClient));

  const isMine = session && entry.userId && entry.userId === session.user.id;

  const { mutate: deleteCommentMutate } = useMutation({
    mutationFn: async (id: number) => {
      if (!session) {
        throw new Error("请先登录");
      }
      const result = await deleteComment({ id }, serverURL);
      if (result._tag === "err") {
        throw new Error(result.error);
      }
      return result.value;
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["comments", { session: session?.user.id }, path],
      });
    },
  });

  const { mutate: toggleSpamMutate } = useMutation({
    mutationFn: async ({ id, isSpam }: { id: number; isSpam: boolean }) => {
      if (!session) {
        throw new Error("请先登录");
      }
      const result = await toggleCommentSpam({ id, isSpam }, serverURL);
      if (result._tag === "err") {
        throw new Error(result.error);
      }
      return result.value;
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["comments", { session: session?.user.id }, path],
      });
    },
  });

  if (!isMine && session?.user.role !== "admin") {
    return <div></div>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isMine && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <MingcuteEditLine />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteCommentMutate(entry.id)}>
              <MingcuteDelete3Line />
              删除
            </DropdownMenuItem>
          </>
        )}
        {session?.user.role === "admin" &&
          typeof entry.isSpam === "boolean" && (
            <DropdownMenuItem
              onClick={() =>
                toggleSpamMutate({ id: entry.id, isSpam: !entry.isSpam })
              }
            >
              <MingcuteShieldShapeLine />
              {entry.isSpam ? "标记为正常" : "标记为垃圾"}
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
