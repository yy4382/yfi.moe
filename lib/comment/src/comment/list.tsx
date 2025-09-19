import { Fragment, useContext, useState } from "react";
import {
  sessionOptions,
  SORT_BY_LABELS,
  SORT_BY_OPTIONS,
  sortByAtom,
} from "./utils";
import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CommentData } from "@repo/api/comment/comment-data";
import { EditIcon, Loader2Icon, ShieldIcon, TrashIcon } from "lucide-react";
import { CommentBoxNew } from "./box/add-comment";
import { CommentBoxEdit } from "./box/edit-comment";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { produce } from "immer";
import type { User } from "@repo/api/auth/client";
import { getComments } from "@repo/api/comment/get";
import { deleteComment } from "@repo/api/comment/delete";
import { toggleCommentSpam } from "@repo/api/comment/toggle-spam";
import { z, ZodError } from "zod";
import {
  AuthClientRefContext,
  PathnameContext,
  ServerURLContext,
} from "./context";
import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MoreIcon from "~icons/mingcute/more-1-line";
import CommentIcon from "~icons/mingcute/comment-line";

const PER_PAGE = 10;

function listOptions(
  user: User | undefined,
  path: string,
  sortBy: (typeof SORT_BY_OPTIONS)[number],
  serverURL: string,
) {
  return infiniteQueryOptions({
    queryKey: ["comments", { session: user?.id }, path, sortBy],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      let result;
      try {
        result = await getComments(
          {
            path,
            limit: PER_PAGE,
            offset: (pageParam - 1) * PER_PAGE,
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
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (
        lastPage.comments.length < PER_PAGE ||
        pages.length * PER_PAGE >= lastPage.total
      ) {
        return undefined;
      }
      return pages.length + 1;
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
      <div className="mt-6 flex items-center justify-center-safe gap-2 p-4 text-center text-red-500">
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
        <div className="flex items-center gap-2 text-comment">
          <span>共{data.pages[0]!.total}条留言</span>
          {(isFetching || isFetchingNextPage) && (
            <span>
              <Loader2Icon className="size-6 animate-spin" />
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
      {data.pages
        .map((page) => page.comments)
        .flat()
        .map((comment) => (
          <Fragment key={comment.id}>
            <CommentItem comment={comment} />
            {comment.children.length > 0 && (
              <div className="ml-6 pl-4">
                {comment.children.map((children) => {
                  const replyToName =
                    children.replyToId === comment.id
                      ? comment.displayName
                      : comment.children.find(
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
              </div>
            )}
          </Fragment>
        ))}
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
        <div className="group mb-1 min-w-0 flex-1 flex flex-col mt-0.5">
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
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => setReplying(!replying)}
              className="text-sm inline-flex items-center gap-1 text-comment"
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
      {replying && (
        <div className="mt-2 ml-8">
          <CommentBoxNew
            reply={{
              parentId: entry.parentId ? entry.parentId : entry.id,
              replyToId: entry.id,
              at: entry.displayName,
              onCancel: () => setReplying(false),
            }}
            onSuccess={() => setReplying(false)}
          />
        </div>
      )}
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
              <EditIcon />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteCommentMutate(entry.id)}>
              <TrashIcon />
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
              <ShieldIcon />
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
