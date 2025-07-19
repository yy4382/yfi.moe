import { Fragment, useContext, useState } from "react";
import { userInfoAtom, YulineContext } from "./utils";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getComment,
  WalineChildComment,
  WalineRootComment,
  deleteComment as deleteCommentApi,
} from "@waline/api";
import { useAtomValue } from "jotai";
import Image from "next/image";
import { EditIcon, Loader2Icon, ReplyIcon, TrashIcon } from "lucide-react";
import { CommentBoxEdit, CommentBoxNew } from "./box";
import { toast } from "sonner";
import { motion } from "motion/react";

const PER_PAGE = 10;

export function CommentList() {
  const { serverURL, url, lang } = useContext(YulineContext);
  const userInfo = useAtomValue(userInfoAtom);
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
    queryKey: [
      "comments",
      { serverURL, lang },
      { token: userInfo?.token },
      url,
    ],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const resp = await getComment({
        serverURL,
        lang,
        path: url,
        page: pageParam,
        pageSize: PER_PAGE,
        sortBy: "insertedAt_desc",
        token: userInfo?.token,
      });
      return resp;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.totalPages) {
        return undefined;
      }
      return lastPage.page + 1;
    },
  });

  if (isPending) {
    return (
      <div className="p-4 text-center text-gray-500 mt-6">加载评论中...</div>
    );
  }
  if (isError) {
    return (
      <div className="p-4 text-center text-red-500 mt-6 flex items-center gap-2 justify-center-safe">
        加载评论失败: {error.message}
        <motion.button
          onClick={() => refetch()}
          className="px-2 py-1 rounded-md shadow-md border border-container text-comment"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          重试
        </motion.button>
      </div>
    );
  }
  if (!data || data.pages.length === 0 || data.pages[0].data.length === 0) {
    return <div className="p-4 text-center text-gray-500 mt-6">暂无评论</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 justify-between mb-2">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span>{data.pages[0].count}条评论</span>
          {(isFetching || isFetchingNextPage) && (
            <span>
              <Loader2Icon className="size-6 animate-spin" />
            </span>
          )}
        </div>
      </div>
      {data.pages.map((page) => (
        <Fragment key={page.page}>
          {page.data.map((comment) => (
            <Fragment key={comment.objectId}>
              <CommentRootItem comment={comment} />
              {comment.children.length > 0 && (
                <div className="ml-6 pl-4">
                  {comment.children.map((children) => (
                    <CommentItem key={children.objectId} comment={children} />
                  ))}
                </div>
              )}
            </Fragment>
          ))}
        </Fragment>
      ))}
      {hasNextPage && (
        <div className="flex justify-center">
          <motion.button
            onClick={() => fetchNextPage()}
            disabled={isFetching}
            className="px-2 py-1 rounded-md shadow-md border border-container text-comment"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFetchingNextPage ? "正在加载..." : "加载更多"}
          </motion.button>
        </div>
      )}
      <div>{isFetching && !isFetchingNextPage ? "加载中..." : null}</div>
    </div>
  );
}

type CommentRootItemProps = {
  comment: WalineRootComment;
};
function CommentRootItem({ comment }: CommentRootItemProps) {
  return (
    <div>
      <CommentItem comment={comment} />
    </div>
  );
}

type CommentItemProps = {
  comment: WalineChildComment | WalineRootComment;
};
function CommentItem({ comment: entry }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const { serverURL, lang, url } = useContext(YulineContext);
  const userInfo = useAtomValue(userInfoAtom);
  const queryClient = useQueryClient();

  const isMine = userInfo && userInfo.objectId === entry.user_id;

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (id: number) => {
      if (!userInfo) {
        throw new Error("请先登录");
      }
      const resp = await deleteCommentApi({
        serverURL,
        lang,
        token: userInfo.token,
        objectId: id,
      });
      if (resp.errmsg) {
        throw new Error(resp.errmsg);
      }
      return resp.data;
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "comments",
          { serverURL, lang },
          { token: userInfo?.token },
          url,
        ],
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
      <div className="flex items-end gap-3 border-gray-100 py-2 last:border-b-0">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          <Image
            unoptimized
            src={entry.avatar}
            alt={entry.nick}
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
              {entry.nick}
            </span>
            {isMine && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
                我
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatTime(new Date(entry.time))}
            </span>
            {(isMine || userInfo?.type === "administrator") && (
              <>
                <button
                  className="flex items-center gap-1 text-xs text-red-700 transition-colors hover:text-red-500"
                  onClick={() => deleteComment(entry.objectId)}
                >
                  <TrashIcon size={14} />
                </button>
                <button
                  className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
                  onClick={() => setEditing(true)}
                >
                  <EditIcon size={14} />
                </button>
              </>
            )}
          </div>

          {editing && userInfo ? (
            <CommentBoxEdit
              editId={entry.objectId}
              onCancel={() => setEditing(false)}
              onSuccess={() => setEditing(false)}
              userInfo={userInfo}
              initialContent={entry.orig}
            />
          ) : (
            <div className="relative inline-block rounded-md rounded-bl-none bg-gray-600/5 px-2 py-1 text-sm break-words">
              {/* 评论内容 */}
              {"reply_user" in entry && entry.reply_user && (
                <div className="text-xs text-gray-500 py-1">
                  <span className="text-gray-500">回复 </span>
                  <span className="text-gray-500">
                    {entry.reply_user.nick}:
                  </span>
                </div>
              )}
              <div
                className="prose prose-sm dark:prose-invert prose-p:my-1"
                dangerouslySetInnerHTML={{ __html: entry.comment }}
              />
              <div className="absolute -right-0 -bottom-0 z-10 cursor-pointer">
                <button
                  className="flex size-5 translate-x-2/3 translate-y-1/4 items-center justify-center rounded-full border border-container bg-gray-600/10 p-0.5 text-xs text-comment"
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
              pid: entry.objectId,
              rid: "rid" in entry && entry.rid ? entry.rid : entry.objectId,
              at: entry.nick,
              onCancel: () => setReplying(false),
            }}
            onSuccess={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}
