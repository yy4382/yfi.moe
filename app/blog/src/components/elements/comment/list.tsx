import { Fragment, useState } from "react";
import {
  sessionOptions,
  SORT_BY_LABELS,
  SORT_BY_OPTIONS,
  sortByAtom,
} from "./utils";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CommentData } from "@/lib/hono/modules/comments/services/comment-data";
import { getCommentsResponse } from "@/lib/hono/modules/comments/model";
import Image from "next/image";
import { EditIcon, Loader2Icon, ReplyIcon, TrashIcon } from "lucide-react";
import { CommentBoxNew } from "./box/add-comment";
import { CommentBoxEdit } from "./box/edit-comment";
import { toast } from "sonner";
import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";
import { honoClient } from "@/lib/client";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";

const PER_PAGE = 10;

export function CommentList() {
  const path = usePathname();
  const { data: session } = useQuery(sessionOptions());
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
  } = useInfiniteQuery({
    queryKey: ["comments", { session: session?.user.id }, path, sortBy],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const resp = await honoClient.comments.get.$post({
        json: {
          path,
          limit: PER_PAGE,
          offset: (pageParam - 1) * PER_PAGE,
          sortBy,
        },
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch comments");
      }
      return getCommentsResponse.parse(await resp.json());
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
  });

  if (isPending) {
    return (
      <div className="mt-6 p-4 text-center text-zinc-500">加载评论中...</div>
    );
  }
  if (isError) {
    return (
      <div className="mt-6 flex items-center justify-center-safe gap-2 p-4 text-center text-red-500">
        加载评论失败: {error.message}
        <motion.button
          onClick={() => refetch()}
          className="border-container text-comment rounded-md border px-2 py-1 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          重试
        </motion.button>
      </div>
    );
  }
  if (!data || data.pages.length === 0 || data.pages[0].comments.length === 0) {
    return <div className="mt-6 p-4 text-center text-zinc-500">暂无留言</div>;
  }

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span>{data.pages[0].total}条留言</span>
          {(isFetching || isFetchingNextPage) && (
            <span>
              <Loader2Icon className="size-6 animate-spin" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {SORT_BY_OPTIONS.map((sortByOption) => (
            <motion.button
              key={sortByOption}
              onClick={() => setSortBy(sortByOption)}
              className={cn(
                "py-1 text-sm",
                sortBy !== sortByOption && "text-muted-foreground",
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {SORT_BY_LABELS[sortByOption]}
            </motion.button>
          ))}
        </div>
      </div>
      {data.pages
        .map((page) => page.comments)
        .flat()
        .map((comment) => (
          <Fragment key={comment.id}>
            <CommentRootItem comment={comment} />
            {comment.children.length > 0 && (
              <div className="ml-6 pl-4">
                {comment.children.map((children) => (
                  <CommentItem key={children.id} comment={children} />
                ))}
              </div>
            )}
          </Fragment>
        ))}
      {hasNextPage && (
        <div className="flex justify-center">
          <motion.button
            onClick={() => fetchNextPage()}
            disabled={isFetching}
            className="border-container text-comment rounded-md border px-2 py-1 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFetchingNextPage ? "正在加载..." : "加载更多"}
          </motion.button>
        </div>
      )}
      <div className="mt-6 text-center text-zinc-500">
        {isFetching && !isFetchingNextPage ? "加载中..." : null}
      </div>
    </div>
  );
}

type CommentRootItemProps = {
  comment: CommentData;
};
function CommentRootItem({ comment }: CommentRootItemProps) {
  return (
    <div>
      <CommentItem comment={comment} />
    </div>
  );
}

type CommentItemProps = {
  comment: CommentData;
};
function CommentItem({ comment: entry }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const path = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useQuery(sessionOptions());

  const isMine = session && entry.userId && entry.userId === session.user.id;

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (id: number) => {
      if (!session) {
        throw new Error("请先登录");
      }
      // const resp = await deleteCommentApi({
      //   serverURL,
      //   lang,
      //   token: userInfo.token,
      //   objectId: id,
      // });
      // if (resp.errmsg) {
      //   throw new Error(resp.errmsg);
      // }
      // return resp.data;
      const resp = await honoClient.comments.delete.$post({
        json: {
          id,
        },
      });
      if (!resp.ok) {
        throw new Error(await resp.text());
      }
      return resp.json();
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", { session: session?.user.id }, path],
      });
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
      <div className="flex items-end gap-3 border-zinc-100 py-2 last:border-b-0">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          <Image
            unoptimized
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
        <div className="group mb-1 min-w-0 flex-1">
          {/* 用户信息行 */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-title text-sm font-semibold">
              {entry.displayName}
            </span>
            {isMine && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
                我
              </span>
            )}
            <span className="text-xs text-zinc-500">
              {formatTime(entry.createdAt)}
            </span>
            {(isMine || session?.user.role === "admin") && (
              <>
                <button
                  className="flex items-center gap-1 text-xs text-red-700 transition-colors hover:text-red-500"
                  onClick={() => deleteComment(entry.id)}
                >
                  <TrashIcon size={14} />
                </button>
                <button
                  className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-700"
                  onClick={() => setEditing(true)}
                >
                  <EditIcon size={14} />
                </button>
              </>
            )}
          </div>

          {editing && session ? (
            <CommentBoxEdit
              editId={entry.id}
              onCancel={() => setEditing(false)}
              onSuccess={() => setEditing(false)}
              initialContent={entry.rawContent}
            />
          ) : (
            <div className="relative inline-block rounded-md rounded-bl-none bg-zinc-600/5 px-2 py-1 text-sm break-words">
              {/* 评论内容 */}
              {/* {"reply_user" in entry && entry.reply_user && (
                <div className="text-xs text-zinc-500 py-1">
                  <span className="text-zinc-500">回复 </span>
                  <span className="text-zinc-500">
                    {entry.reply_user.nick}:
                  </span>
                </div>
              )} */}
              <div
                className="prose prose-sm dark:prose-invert prose-p:my-1"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
              <div className="absolute -right-0 -bottom-0 z-10 cursor-pointer">
                <button
                  className="border-container text-comment flex size-5 translate-x-2/3 translate-y-1/4 items-center justify-center rounded-full border bg-zinc-600/10 p-0.5 text-xs"
                  onClick={() => setReplying((prev) => !prev)}
                >
                  <ReplyIcon className="size-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {replying && (
        <div className="mt-2">
          <CommentBoxNew
            reply={{
              pid: entry.id,
              rid: entry.replyToId ? entry.replyToId : entry.id,
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
