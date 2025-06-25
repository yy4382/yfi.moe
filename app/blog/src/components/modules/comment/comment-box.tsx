import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "@utils/hooks/usePathname";
import { createContext, useContext, useState } from "react";
import SendIcon from "~icons/mingcute/send-plane-line";
import { authClient } from "@utils/auth-client";
import { commentPostBodySchema } from "@repo/api-datatypes/comment";
import z from "zod/v4";
import { motion } from "motion/react";
import GithubIcon from "~icons/mingcute/github-line";
import XIcon from "~icons/mingcute/close-line";
import { toast } from "sonner";
import type { ZodIssue } from "zod";
import { getGravatarUrl } from "@utils/get-gavatar";
import { sessionOptions } from "./session";
import LoadingIcon from "~icons/mingcute/loading-line";

const CommentBoxContext = createContext<{
  parentId?: number;
  replyingTo?: number;
  value: string;
  onChange: (value: string) => void;
  submitPending: boolean;
}>({
  value: "",
  onChange: () => {},
  submitPending: false,
});

export function CommentBox({
  parentId,
  replyingTo,
  onSuccess,
}: {
  parentId?: number;
  replyingTo?: number;
  onSuccess?: () => void;
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useQuery(sessionOptions());
  const [content, setContent] = useState("");
  const { isPending, mutate } = useMutation({
    mutationFn: async (data: z.infer<typeof commentPostBodySchema>) => {
      const response = await fetch(
        `/api/comments/v1/${encodeURIComponent(pathname)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, parentId, replyingTo }),
        },
      );
      if (!response.ok) {
        const data = await response.json();
        if (data.type === "zod error") {
          throw new Error(
            data.error.map((error: ZodIssue) => error.message).join(","),
          );
        } else {
          throw new Error(data.error);
        }
      }
      return response.json();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", pathname] });
      onSuccess?.();
    },
  });

  const {
    data: accounts,
    isPending: isAccountsPending,
    isError: isAccountsError,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const accounts = await authClient.listAccounts();
      return accounts;
    },
  });

  return (
    <CommentBoxContext
      value={{
        parentId,
        replyingTo,
        value: content,
        onChange: setContent,
        submitPending: isPending,
      }}
    >
      <div>
        {session ? (
          <div className="flex w-full items-end gap-4">
            <div className="group relative mb-2 flex-shrink-0">
              <img
                src={session.user.image ?? getGravatarUrl(session.user.email)}
                alt={session.user.name}
                className="aspect-square size-14 rounded-full ring-2 ring-black dark:ring-white"
              />
              <div className="absolute -top-1 -right-1 z-10 hidden size-4 rounded-md bg-gray-500/50 p-0.5 group-hover:block">
                <button
                  onClick={async () => {
                    await authClient.signOut();
                    queryClient.invalidateQueries({ queryKey: ["session"] });
                    queryClient.invalidateQueries({ queryKey: ["accounts"] });
                    // need to invalidate comments, because `isMine` or other admin fields may be changed due to sign out
                    queryClient.invalidateQueries({ queryKey: ["comments"] });
                  }}
                  className="flex size-full items-center justify-center"
                >
                  <XIcon className="size-2.5" />
                </button>
              </div>
              {!isAccountsError &&
                !isAccountsPending &&
                accounts?.data?.find(
                  (account: any) => account.provider === "github",
                ) && (
                  <span className="absolute -right-1 -bottom-1 z-10 flex items-center justify-center rounded-full bg-white p-0.5 pb-0 ring-1 dark:ring-black">
                    <GithubIcon className="size-3.5 text-black" />
                  </span>
                )}
            </div>
            <InputBox onSubmit={(data) => mutate({ content, ...data })} />
          </div>
        ) : (
          <VisitorCommentBox
            onSubmit={(data) => mutate({ content, ...data })}
          />
        )}
      </div>
    </CommentBoxContext>
  );
}

function VisitorCommentBox({
  onSubmit,
}: {
  onSubmit: (
    data?: Omit<Partial<z.infer<typeof commentPostBodySchema>>, "content">,
  ) => void;
}) {
  const [asVisitor, setAsVisitor] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  return (
    <div>
      {asVisitor ? (
        <div className="flex flex-col gap-2">
          <div className="flex w-full justify-between gap-2">
            <input
              type="text"
              placeholder="昵称*"
              className="flex-1 rounded-md border border-container p-1 focus:ring focus:ring-primary focus:outline-none"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
            />
            <input
              type="text"
              placeholder="邮箱*"
              className="flex-1 rounded-md border border-container p-1 focus:ring focus:ring-primary focus:outline-none"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
            />
            <button
              onClick={() => setAsVisitor(false)}
              className="rounded-md border border-container bg-bg px-2 py-1 text-sm shadow"
            >
              使用社交账号登录
            </button>
          </div>
          <InputBox
            onSubmit={() =>
              onSubmit({
                visitorName: visitorName ? visitorName : undefined,
                visitorEmail: visitorEmail ? visitorEmail : undefined,
              })
            }
          />
        </div>
      ) : (
        <div className="flex min-h-36 w-full flex-col items-center justify-between gap-2 rounded-sm border border-container bg-gray-50 py-4 dark:bg-gray-950">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-comment">使用社交账号登录</span>
            <motion.button
              onClick={async () => {
                const data = await authClient.signIn.social({
                  provider: "github",
                  callbackURL: `${window.location.href}`,
                });
                console.log(data);
              }}
              className="flex items-center gap-1 rounded-full border border-container bg-bg p-2 shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GithubIcon className="size-4" />
            </motion.button>
          </div>
          <motion.button
            onClick={() => setAsVisitor(true)}
            className="rounded-full border border-container bg-bg px-2 py-1 text-sm shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            以游客身份评论
          </motion.button>
        </div>
      )}
    </div>
  );
}

function InputBox({
  onSubmit,
}: {
  onSubmit: (
    data?: Omit<Partial<z.infer<typeof commentPostBodySchema>>, "content">,
  ) => void;
}) {
  const { parentId, replyingTo, value, onChange, submitPending } =
    useContext(CommentBoxContext);

  const [preview, setPreview] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: previewData,
    isPending: isPreviewPending,
    error: previewError,
  } = useQuery({
    queryKey: ["markdown", { parentId, replyingTo }],
    queryFn: async () => {
      const response = await fetch("/api/utils/v1/getMarkdown", {
        method: "POST",
        body: JSON.stringify({ markdown: value }),
      });
      if (!response.ok) {
        throw new Error("Failed to parse markdown");
      }
      const data = await response.json();
      return data.html as string;
    },
    enabled: !!value && preview,
  });
  return (
    <div className="group flex min-h-36 w-full flex-col justify-between rounded-sm border border-container p-1 focus-within:ring focus-within:ring-primary">
      {preview && value.trim().length > 0 ? (
        <div className="min-h-18 w-full flex-1 bg-transparent px-1 py-0.5 text-sm">
          {isPreviewPending ? (
            <div className="flex items-center justify-center">
              <LoadingIcon className="size-4 animate-spin" />
            </div>
          ) : previewError ? (
            <div className="text-red-500">{previewError.message}</div>
          ) : (
            <div
              className="prose prose-sm *:first:mt-0 *:last:mb-0 dark:prose-invert prose-p:my-2"
              dangerouslySetInnerHTML={{ __html: previewData }}
            />
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Leave a comment"
          className="field-sizing-content min-h-18 w-full flex-1 resize-none bg-transparent px-1 py-0.5 text-sm outline-none"
          disabled={submitPending}
        />
      )}
      <div className="flex items-center justify-between gap-2 px-1 text-sm text-comment">
        <div className="flex items-center gap-2 text-xs text-comment/90">
          <div className="flex items-center gap-2">
            支持 Markdown
            <motion.button
              onClick={() => {
                setPreview(!preview);
                queryClient.invalidateQueries({ queryKey: ["markdown"] });
              }}
              className="rounded-md border border-container px-1 text-xs disabled:opacity-50"
              disabled={submitPending || !value.trim()}
              whileHover={{ scale: value.trim().length > 0 ? 1.05 : 1 }}
              whileTap={{ scale: value.trim().length > 0 ? 0.95 : 1 }}
            >
              {preview ? "编辑" : "预览"}
            </motion.button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div>{value.length} / 500</div>
          <motion.button
            onClick={() => onSubmit()}
            className="flex items-center gap-0.5 disabled:opacity-50"
            disabled={submitPending || !value.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SendIcon />
            发送
          </motion.button>
        </div>
      </div>
    </div>
  );
}
