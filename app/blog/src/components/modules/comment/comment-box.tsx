import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "@utils/hooks/usePathname";
import { useState, type ComponentProps } from "react";
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
        `/api/comments/${encodeURIComponent(pathname)}`,
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
          <InputBox
            value={content}
            onChange={setContent}
            onSubmit={(data) => mutate({ content, ...data })}
            isPending={isPending}
          />
        </div>
      ) : (
        <VisitorCommentBox
          value={content}
          onChange={setContent}
          onSubmit={(data) => mutate({ content, ...data })}
          isPending={isPending}
        />
      )}
    </div>
  );
}

function VisitorCommentBox({
  onSubmit,
  ...props
}: ComponentProps<typeof InputBox>) {
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
            {...props}
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

type InputBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (
    data?: Omit<Partial<z.infer<typeof commentPostBodySchema>>, "content">,
  ) => void;
  isPending: boolean;
};
function InputBox({ value, onChange, onSubmit, isPending }: InputBoxProps) {
  return (
    <div className="group flex min-h-36 w-full flex-col justify-between rounded-sm border border-container p-1 focus-within:ring focus-within:ring-primary">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Leave a comment"
        className="field-sizing-content min-h-18 w-full flex-1 resize-none bg-transparent px-1 py-0.5 text-sm outline-none"
      />
      <div className="flex items-center justify-between gap-2 px-1 text-sm text-comment">
        <div>{value.length} / 500</div>
        <motion.button
          onClick={() => onSubmit()}
          className="flex items-center gap-0.5 disabled:opacity-50"
          disabled={isPending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SendIcon />
          发送
        </motion.button>
      </div>
    </div>
  );
}
