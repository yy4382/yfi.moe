import {
  useQueryClient,
  useQuery,
  useMutation,
  type InfiniteData,
} from "@tanstack/react-query";
import { produce } from "immer";
import { atom, type PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { motion } from "motion/react";
import { type PropsWithChildren, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import MingcuteCloseLine from "~icons/mingcute/close-line";
import GitHubIcon from "~icons/mingcute/github-line";
import MailSendLineIcon from "~icons/mingcute/mail-send-line";
import type {
  GetCommentsChildrenResponse,
  LayeredCommentData,
} from "@repo/api/comment/get.model";
import { getDiceBearUrl } from "@repo/helpers/get-gravatar-url";
import type { AuthClient } from "@/lib/auth/create-auth";
import { getRefetchSessionUrl } from "@/lib/auth/refetch-session-url";
import { sessionOptions, sessionOptionsKey } from "@/lib/auth/session-options";
import {
  addComment,
  commentAddParamsBranded,
  type CommentAddParamsBranded,
} from "../../lib/api/comment/add";
import {
  useAuthClient,
  useHonoClient,
  usePathname,
} from "../../lib/hooks/context";
import {
  persistentEmailAtom,
  persistentAsVisitorAtom,
  persistentNameAtom,
  sortByAtom,
} from "../atoms";
import { type CommentBoxId, CommentBoxIdContext } from "./context";
import { InputBox } from "./input-area";
import { MagicLinkDialog } from "./magic-link-dialog";

function useAddComment({
  onSuccess,
  id,
}: {
  onSuccess?: () => void;
  id: CommentBoxId;
}) {
  const path = usePathname();
  const queryClient = useQueryClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);
  const honoClient = useHonoClient();

  const mutation = useMutation({
    mutationKey: ["addComment", id],
    mutationFn: (params: CommentAddParamsBranded) =>
      addComment(params, honoClient),
    onSuccess: (data) => {
      onSuccess?.();

      // Handle spam detection feedback
      if (data.isSpam) {
        toast.warning(
          "您的评论已被标记为可能的垃圾内容。管理员会对此进行二次审核，通过后会正常显示。",
          {
            duration: 10000,
            description: "如果您认为这是误判，请联系管理员。",
          },
        );
      }

      // Check if this email has commented before and show toast
      const userEmail = data.data.visitorEmail ?? data.data.userEmail;
      if (userEmail && !data.isSpam) {
        const commentedEmailsStr = localStorage.getItem("commented-emails");
        const commentedEmails: string[] = commentedEmailsStr
          ? (JSON.parse(commentedEmailsStr) as string[])
          : [];

        if (!commentedEmails.includes(userEmail)) {
          commentedEmails.push(userEmail);
          localStorage.setItem(
            "commented-emails",
            JSON.stringify(commentedEmails),
          );
          toast.info(
            "当有人回复您的评论时，您将收到邮件通知。如需取消订阅，可点击邮件中的退订链接。",
            {
              duration: 8000,
            },
          );
        }
      }

      // Only add to comment list if it's not spam (spam comments need admin approval)
      if (!data.isSpam) {
        if (!data.data.parentId) {
          queryClient.setQueryData(
            ["comments", { session: session?.user.id }, path, sortBy],
            (old: {
              pages: { comments: LayeredCommentData[]; total: number }[];
            }) => {
              return produce(old, (draft) => {
                draft.pages[0]!.comments.unshift({
                  data: data.data,
                  children: {
                    data: [],
                    hasMore: false,
                    cursor: 0,
                    total: 0,
                  },
                });
                draft.pages[0]!.total++;
              });
            },
          );
        } else {
          queryClient.setQueryData(
            [
              "comments",
              { session: session?.user.id },
              path,
              sortBy,
              data.data.parentId,
            ],
            (old: InfiniteData<GetCommentsChildrenResponse>) => {
              return produce(old, (draft) => {
                draft.pages.at(-1)!.data.push(data.data);
              });
            },
          );
        }
      }
      void queryClient.invalidateQueries({
        queryKey: ["comments", { session: session?.user.id }, path],
      });
    },
  });
  return mutation;
}

type CommentBoxNewProps = {
  reply?: {
    parentId: number;
    replyToId: number;
    at?: string;
    onCancel?: () => void;
  };
  onSuccess?: () => void;
};

const useNewCommentData = () => {
  const [contentAtom] = useState<PrimitiveAtom<string>>(() => atom(""));
  const [isAnonymousAtom] = useState<PrimitiveAtom<boolean>>(() => atom(false));
  return {
    contentAtom: contentAtom,
    isAnonymousAtom: isAnonymousAtom,
  };
};

export function CommentBoxNew({ reply, onSuccess }: CommentBoxNewProps) {
  const path = usePathname();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));

  const commentBoxId = {
    parentId: reply?.parentId,
    replyingTo: reply?.replyToId,
    path,
  };

  const atoms = useNewCommentData();

  const [content, setContent] = useAtom(atoms.contentAtom);
  const isAnonymous = useAtomValue(atoms.isAnonymousAtom);
  const visitorEmail = useAtomValue(persistentEmailAtom);
  const visitorName = useAtomValue(persistentNameAtom);
  const data = useMemo(() => {
    return {
      content,
      isAnonymous,
      ...(session ? {} : { visitorEmail, visitorName }),
    };
  }, [content, isAnonymous, visitorEmail, visitorName, session]);

  const { mutate } = useAddComment({
    onSuccess,
    id: commentBoxId,
  });
  const mutateUnchecked = useCallback(() => {
    const { data: parsedData, error } = commentAddParamsBranded.safeParse({
      path,
      replyToId: reply?.replyToId,
      parentId: reply?.parentId,
      ...data,
    });
    if (error) {
      const firstError = error.issues[0];
      toast.error(firstError?.message);
      return;
    }
    mutate(parsedData, {
      onSuccess: () => {
        setContent("");
      },
    });
  }, [mutate, reply?.parentId, reply?.replyToId, path, data, setContent]);

  const replyPlaceholder = reply?.at ? `回复 @${reply.at}：` : undefined;

  return (
    <CommentBoxIdContext value={commentBoxId}>
      {session ? (
        <UserBox session={session}>
          <InputBox
            submit={mutateUnchecked}
            contentAtom={atoms.contentAtom}
            isAnonymousAtom={atoms.isAnonymousAtom}
            mutationKey={["addComment", commentBoxId]}
            placeholder={replyPlaceholder}
          />
        </UserBox>
      ) : (
        <VisitorBox>
          <InputBox
            submit={mutateUnchecked}
            contentAtom={atoms.contentAtom}
            mutationKey={["addComment", commentBoxId]}
            placeholder={
              replyPlaceholder ??
              "注册后可以编辑、删除留言，并且通过邮件获取回复通知哦"
            }
          />
        </VisitorBox>
      )}
    </CommentBoxIdContext>
  );
}

function VisitorBox({ children }: PropsWithChildren) {
  const [asVisitor, setAsVisitor] = useAtom(persistentAsVisitorAtom);
  const [visitorName, setVisitorName] = useAtom(persistentNameAtom);
  const [visitorEmail, setVisitorEmail] = useAtom(persistentEmailAtom);

  if (!asVisitor) {
    return <VisitorBoxLogin setAsVisitor={() => setAsVisitor(true)} />;
  }

  return (
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
          className="rounded-md border border-container bg-background px-2 py-1 text-sm shadow"
        >
          登录/注册
        </button>
      </div>
      {children}
    </div>
  );
}

function VisitorBoxLogin({ setAsVisitor }: { setAsVisitor: () => void }) {
  // const queryClient = useQueryClient();
  const authClient = useAuthClient();
  // const { status } = useQuery(sessionOptions(authClient));
  // if (status === "pending")
  //   return (
  //     <div className="border-container bg-card text-muted-foreground flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-sm border py-4">
  //       <div className="flex items-center gap-2">
  //         <Loader2Icon className="size-8 animate-spin" />
  //         <p className="ml-4 text-sm">检查登录状态...</p>
  //       </div>
  //     </div>
  //   );
  return (
    <div className="flex min-h-36 w-full flex-col items-center justify-between gap-2 rounded-sm border border-container bg-card py-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-comment">使用社交账号登录</span>
        <div className="flex gap-2">
          <motion.button
            onClick={() => {
              const fn = async () => {
                const callbackURL = getRefetchSessionUrl();
                const { error } = await authClient.signIn.social({
                  provider: "github",
                  callbackURL: callbackURL.href,
                });
                if (error) {
                  toast.error(error.message);
                  return;
                }
              };
              void fn();
            }}
            className="flex items-center gap-1 rounded-full border border-container bg-background p-2 shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GitHubIcon className="size-4" />
          </motion.button>

          <MagicLinkDialog>
            <motion.button
              className="flex items-center gap-1 rounded-full border border-container bg-background p-2 shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MailSendLineIcon className="size-4" />
            </motion.button>
          </MagicLinkDialog>
        </div>
      </div>
      <motion.button
        onClick={setAsVisitor}
        className="rounded-full border border-container bg-background px-3 py-1.5 text-sm shadow"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        以游客身份留言
      </motion.button>
    </div>
  );
}

type UserBoxProps = PropsWithChildren<{
  session: AuthClient["$Infer"]["Session"];
}>;

function UserBox({ children, session }: UserBoxProps) {
  const queryClient = useQueryClient();
  const authClient = useAuthClient();

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

  const handleSignOut = useCallback(async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    void queryClient.invalidateQueries(sessionOptionsKey);
    void queryClient.invalidateQueries({ queryKey: ["comments"] });
  }, [queryClient, authClient]);

  return (
    <div className="flex w-full items-end gap-4">
      <div className="group relative mb-2 shrink-0">
        <img
          src={session.user.image ?? getDiceBearUrl(session.user.email)}
          alt={session.user.name}
          width={56}
          height={56}
          className="aspect-square size-14 rounded-full ring-2 ring-black dark:ring-white"
        />
        <div className="absolute -top-1 -right-1 z-10 hidden size-4 rounded-md bg-zinc-500/50 p-0.5 group-hover:block">
          <button
            onClick={() => void handleSignOut()}
            className="flex size-full items-center justify-center"
          >
            <MingcuteCloseLine className="size-2.5" />
          </button>
        </div>
        {!isAccountsError &&
          !isAccountsPending &&
          accounts?.data?.find(
            (account) => account.providerId === "github",
          ) && (
            <span className="absolute -right-1 -bottom-1 z-10 flex items-center justify-center rounded-full bg-white p-0.5 pb-0 ring-1 dark:ring-black">
              <GitHubIcon className="size-3.5 text-black" />
            </span>
          )}
      </div>
      {children}
    </div>
  );
}
