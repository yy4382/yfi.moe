import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { addComment, commentAddParamsBranded } from "../comment-api/add";
import {
  persistentEmailAtom,
  persistentAsVisitorAtom,
  persistentNameAtom,
  sessionOptions,
  sortByAtom,
} from "../utils";
import {
  CommentBoxFillingData,
  CommentBoxIdContext,
  CommentBoxStatusContext,
  WithSuccess,
} from "./context";
import Image from "next/image";
import { Loader2Icon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { authClient, Session } from "@/lib/client";
import GithubIcon from "@/assets/icons/MingcuteGithubLine";
import { MingcuteMailSendLine } from "@/assets/icons/MingcuteMailSendLine";
import { getGravatarUrl } from "@/lib/utils/get-gravatar-url";
import { InputBox } from "./input-area";
import { MagicLinkDialog } from "./magic-link-dialog";
import { useAtom, useAtomValue } from "jotai";
import { produce } from "immer";
import { LayeredCommentData } from "@/lib/hono/models";

function useAddComment({ onSuccess }: { onSuccess?: () => void }) {
  const path = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useQuery(sessionOptions());
  const sortBy = useAtomValue(sortByAtom);

  const mutation = useMutation({
    mutationFn: addComment,
    onSuccess: (data) => {
      onSuccess?.();
      queryClient.setQueryData(
        ["comments", { session: session?.user.id }, path, sortBy],
        (old: {
          pages: { comments: LayeredCommentData[]; total: number }[];
        }) => {
          if (!data.data.parentId)
            return produce(old, (draft) => {
              draft.pages[0].comments.unshift({ ...data.data, children: [] });
              draft.pages[0].total++;
            });
          else {
            return produce(old, (draft) => {
              let parentIndex = [-1, -1];
              for (let i = 0; i < old.pages.length; i++) {
                for (let j = 0; j < old.pages[i].comments.length; j++) {
                  if (old.pages[i].comments[j].id === data.data.parentId) {
                    parentIndex = [i, j];
                    break;
                  }
                }
              }
              if (parentIndex[0] === -1) return old;
              draft.pages[parentIndex[0]].comments[
                parentIndex[1]
              ].children.push(data.data);
            });
          }
        },
      );
      queryClient.invalidateQueries({
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
export function CommentBoxNew({ reply, onSuccess }: CommentBoxNewProps) {
  const path = usePathname();
  const { data: session } = useQuery(sessionOptions());

  const { mutate, status, reset } = useAddComment({ onSuccess });
  const mutateUnchecked = useCallback(
    (arg: CommentBoxFillingData, opt: { onSuccess: () => void }) => {
      const { data, error } = commentAddParamsBranded.safeParse({
        path,
        replyToId: reply?.replyToId,
        parentId: reply?.parentId,
        ...arg,
      });
      if (error) {
        const firstError = error.issues[0];
        toast.error(`${firstError.path.join(".")}: ${firstError.message}`);
        return;
      }
      mutate(data, opt);
    },
    [mutate, reply?.parentId, reply?.replyToId, path],
  );

  return (
    <CommentBoxIdContext
      value={{ parentId: reply?.parentId, replyingTo: reply?.replyToId, path }}
    >
      <CommentBoxStatusContext
        value={{
          status,
          reset,
          cancel: reply?.onCancel,
          placeholder: reply?.at ? `回复 ${reply.at}` : undefined,
        }}
      >
        {session ? (
          <UserBox submit={mutateUnchecked} session={session} />
        ) : (
          <VisitorBox submit={mutateUnchecked} />
        )}
      </CommentBoxStatusContext>
    </CommentBoxIdContext>
  );
}

type VisitorBoxProps = {
  submit: WithSuccess<(data: CommentBoxFillingData) => void>;
};
function VisitorBox({ submit }: VisitorBoxProps) {
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
          className="border-container focus:ring-primary flex-1 rounded-md border p-1 focus:ring focus:outline-none"
          value={visitorName}
          onChange={(e) => setVisitorName(e.target.value)}
        />
        <input
          type="text"
          placeholder="邮箱*"
          className="border-container focus:ring-primary flex-1 rounded-md border p-1 focus:ring focus:outline-none"
          value={visitorEmail}
          onChange={(e) => setVisitorEmail(e.target.value)}
        />
        <button
          onClick={() => setAsVisitor(false)}
          className="border-container bg-bg rounded-md border px-2 py-1 text-sm shadow"
        >
          登录/注册
        </button>
      </div>
      <InputBox
        submit={(content, opt) =>
          submit(
            {
              content,
              visitorName,
              visitorEmail,
            },
            opt,
          )
        }
        placeholder="注册后可以编辑、删除留言，并且通过邮件获取回复通知哦"
      />
    </div>
  );
}
function VisitorBoxLogin({ setAsVisitor }: { setAsVisitor: () => void }) {
  const queryClient = useQueryClient();
  const state = queryClient.getQueryState(sessionOptions().queryKey);
  const status = state?.status;
  if (status === "pending")
    return (
      <div className="border-container bg-card text-muted-foreground flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-sm border py-4">
        <div className="flex items-center gap-2">
          <Loader2Icon className="size-8 animate-spin" />
          <p className="ml-4 text-sm">检查登录状态...</p>
        </div>
      </div>
    );
  return (
    <div className="border-container bg-card flex min-h-36 w-full flex-col items-center justify-between gap-2 rounded-sm border py-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-comment text-xs">使用社交账号登录</span>
        <div className="flex gap-2">
          <motion.button
            onClick={async () => {
              const { error } = await authClient.signIn.social({
                provider: "github",
                callbackURL: `${window.location.href}`,
              });
              if (error) {
                toast.error(error.message);
                return;
              }
              queryClient.invalidateQueries(sessionOptions());
            }}
            className="border-container bg-bg flex items-center gap-1 rounded-full border p-2 shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GithubIcon className="size-4" />
          </motion.button>

          <MagicLinkDialog>
            <motion.button
              className="border-container bg-bg flex items-center gap-1 rounded-full border p-2 shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MingcuteMailSendLine className="size-4" />
            </motion.button>
          </MagicLinkDialog>
        </div>
      </div>
      <motion.button
        onClick={setAsVisitor}
        className="border-container bg-bg rounded-full border px-2 py-1 text-sm shadow"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        以游客身份留言
      </motion.button>
    </div>
  );
}

type UserBoxProps = {
  submit: WithSuccess<(data: { content: string }) => void>;
  session: Session;
};
function UserBox({ submit, session }: UserBoxProps) {
  const queryClient = useQueryClient();

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
    queryClient.invalidateQueries(sessionOptions());
    queryClient.invalidateQueries({ queryKey: ["comments"] });
  }, [queryClient]);

  return (
    <div className="flex w-full items-end gap-4">
      <div className="group relative mb-2 flex-shrink-0">
        <Image
          src={session.user.image ?? getGravatarUrl(session.user.email)}
          alt={session.user.name}
          width={56}
          height={56}
          unoptimized
          className="aspect-square size-14 rounded-full ring-2 ring-black dark:ring-white"
        />
        <div className="absolute -top-1 -right-1 z-10 hidden size-4 rounded-md bg-zinc-500/50 p-0.5 group-hover:block">
          <button
            onClick={handleSignOut}
            className="flex size-full items-center justify-center"
          >
            <XIcon className="size-2.5" />
          </button>
        </div>
        {!isAccountsError &&
          !isAccountsPending &&
          accounts?.data?.find((account) => account.provider === "github") && (
            <span className="absolute -right-1 -bottom-1 z-10 flex items-center justify-center rounded-full bg-white p-0.5 pb-0 ring-1 dark:ring-black">
              <GithubIcon className="size-3.5 text-black" />
            </span>
          )}
      </div>
      <InputBox submit={(c, opt) => submit({ content: c }, opt)} />
    </div>
  );
}
