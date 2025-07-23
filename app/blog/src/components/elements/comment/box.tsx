import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { sessionOptions } from "./utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Loader2Icon, SendIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import z from "zod";
import { toast } from "sonner";
import { authClient, honoClient, Session } from "@/lib/client";
import type { InferRequestType } from "hono/client";
import GithubIcon from "@/assets/icons/MingcuteGithubLine";
import { usePathname } from "next/navigation";
import { getGravatarUrl } from "@/lib/utils/get-gravatar-url";

/*
Hierarchy:

<CommentBoxNew>
  <UserBox | VisitorBox>
    <InputBox />
  </UserBox | VisitorBox>
</CommentBoxNew>

or:

<CommentBoxEdit>
  <InputBox />
</CommentBoxEdit>

*/

type CommentBoxId = {
  parentId?: number;
  replyingTo?: number;
  editId?: number;
  path: string;
};

const CommentBoxIdContext = createContext<CommentBoxId>({ path: "" });

type CommentBoxStatus = {
  isPending: boolean;
  isSuccess: boolean;
  placeholder?: string;
  reset: () => void;
  cancel?: () => void;
};
const CommentBoxStatusContext = createContext<CommentBoxStatus>({
  isPending: false,
  isSuccess: false,
  reset: () => {},
});

const commentContentSchema = z
  .preprocess(
    (value) => {
      if (typeof value === "string") {
        return value.trim();
      }
      return value;
    },
    z.string().min(1, "内容不能为空").max(500, "内容不能超过 500 字"),
  )
  .brand("commentContent");

const userAddCommentSchema = z
  .object({
    content: commentContentSchema,
  })
  .brand("userAddComment");
const visitorAddCommentSchema = z
  .object({
    content: commentContentSchema,
    visitorName: z.string().min(1, "昵称不能为空"),
    visitorEmail: z.email("邮箱格式不正确"),
  })
  .brand("visitorAddComment");

type CommentBoxNewProps = {
  reply?: {
    pid: number;
    rid: number;
    at?: string;
    onCancel?: () => void;
  };
  onSuccess?: () => void;
};
export function CommentBoxNew({ reply, onSuccess }: CommentBoxNewProps) {
  const path = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useQuery(sessionOptions());

  const { isPending, mutate, isSuccess, reset } = useMutation({
    mutationFn: async (
      arg: InferRequestType<typeof honoClient.comments.add.$post>["json"],
    ) => {
      // const resp = await addComment(...args);
      // if (resp.errno !== 0 || !resp.data) {
      //   toast.error(resp.errmsg);
      //   throw new Error(resp.errmsg);
      // }
      // return resp.data;
      const resp = await honoClient.comments.add.$post({
        json: arg,
      });
      if (!resp.ok) {
        throw new Error(await resp.text());
      }
      return resp.json();
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["comments", { session: session?.user.id }, path],
      });
    },
  });

  const handleUserSubmit = (data: z.infer<typeof userAddCommentSchema>) => {
    mutate({
      path,
      content: data.content,
      parentId: reply?.pid,
      replyToId: reply?.rid,
    });
  };

  const handleVisitorSubmit = (
    data: z.infer<typeof visitorAddCommentSchema>,
  ) => {
    mutate({
      path,
      parentId: reply?.pid,
      replyToId: reply?.rid,
      ...data,
    });
  };

  return (
    <CommentBoxIdContext
      value={{ parentId: reply?.pid, replyingTo: reply?.rid, path }}
    >
      <CommentBoxStatusContext
        value={{
          isPending,
          isSuccess,
          reset,
          cancel: reply?.onCancel,
          placeholder: reply?.at ? `回复 ${reply.at}` : undefined,
        }}
      >
        {session ? (
          <UserBox submit={handleUserSubmit} session={session} />
        ) : (
          <VisitorBox submit={handleVisitorSubmit} />
        )}
      </CommentBoxStatusContext>
    </CommentBoxIdContext>
  );
}

export function CommentBoxEdit({
  editId,
  initialContent,
  onCancel,
  onSuccess,
}: {
  editId: number;
  initialContent: string;
  onCancel: () => void;
  onSuccess?: () => void;
}) {
  const path = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useQuery(sessionOptions());
  const { isPending, isSuccess, mutate, reset } = useMutation({
    mutationFn: async (content: z.infer<typeof commentContentSchema>) => {
      // const resp = await updateComment({
      //   serverURL,
      //   lang,
      //   token: userInfo.token,
      //   objectId: editId,
      //   comment: { comment: content },
      // });
      // if (resp.errno !== 0 || !resp.data) {
      //   toast.error(resp.errmsg);
      //   throw new Error(resp.errmsg);
      // }
      // return resp.data;
      const resp = await honoClient.comments.update.$post({
        json: {
          id: editId,
          rawContent: content,
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
      onSuccess?.();
    },
  });

  const handleSubmit = (content: string) => {
    const parsed = commentContentSchema.safeParse(content);
    if (!parsed.success) {
      toast.error(z.prettifyError(parsed.error));
      console.warn(parsed.error);
      return;
    }
    mutate(parsed.data);
  };

  return (
    <CommentBoxIdContext value={{ editId, path }}>
      <CommentBoxStatusContext
        value={{ isPending, isSuccess, reset, cancel: onCancel }}
      >
        <InputBox submit={handleSubmit} initialContent={initialContent} />
      </CommentBoxStatusContext>
    </CommentBoxIdContext>
  );
}

type VisitorBoxProps = {
  submit: (data: z.infer<typeof visitorAddCommentSchema>) => void;
};
function VisitorBox({ submit }: VisitorBoxProps) {
  const [asVisitor, setAsVisitor] = useState(false);

  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");

  const handleSubmit = useCallback(
    (content: string) => {
      const parsed = visitorAddCommentSchema.safeParse({
        content,
        visitorName,
        visitorEmail,
      });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        console.warn(parsed.error);
        return;
      }
      submit(parsed.data);
    },
    [visitorName, visitorEmail, submit],
  );

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
          className="rounded-md border border-container bg-bg px-2 py-1 text-sm shadow"
        >
          登录/注册
        </button>
      </div>
      <InputBox
        submit={handleSubmit}
        placeholder="注册后可以编辑、删除留言，并且通过邮件获取回复通知哦"
      />
    </div>
  );
}
function VisitorBoxLogin({ setAsVisitor }: { setAsVisitor: () => void }) {
  const queryClient = useQueryClient();
  return (
    <div className="flex min-h-36 w-full flex-col items-center justify-between gap-2 rounded-sm border border-container py-4 bg-card">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-comment">使用社交账号登录</span>
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
          className="flex items-center gap-1 rounded-full border border-container bg-bg p-2 shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GithubIcon className="size-4" />
        </motion.button>
      </div>
      <motion.button
        onClick={setAsVisitor}
        className="rounded-full border border-container bg-bg px-2 py-1 text-sm shadow"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        以游客身份留言
      </motion.button>
    </div>
  );
}

type UserBoxProps = {
  submit: (data: z.infer<typeof userAddCommentSchema>) => void;
  session: Session;
};
function UserBox({ submit, session }: UserBoxProps) {
  const queryClient = useQueryClient();
  const handleSubmit = useCallback(
    (content: string) => {
      const parsed = userAddCommentSchema.safeParse({ content });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        console.warn(parsed.error);
        return;
      }
      submit(parsed.data);
    },
    [submit],
  );

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
      <InputBox submit={handleSubmit} />
    </div>
  );
}

type InputBoxProps = {
  submit: (content: string) => void;
  initialContent?: string;
  placeholder?: string;
};
function InputBox({ submit, initialContent, placeholder }: InputBoxProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const {
    isPending: submitPending,
    isSuccess,
    reset,
    cancel,
    placeholder: placeholderFromContext,
  } = useContext(CommentBoxStatusContext);

  const handleSubmit = useCallback(() => {
    submit(content);
  }, [content, submit]);

  useEffect(() => {
    if (isSuccess) {
      setContent("");
    }
  }, [isSuccess]);

  return (
    <div className="group flex min-h-36 w-full flex-col justify-between rounded-sm border border-container p-1 focus-within:ring focus-within:ring-primary relative">
      {cancel && (
        <div className="absolute -top-3 -right-2">
          <motion.button
            onClick={cancel}
            className="rounded-full bg-zinc-200 p-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <XIcon className="size-3" />
          </motion.button>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => {
          if (isSuccess) {
            reset();
          }
          setContent(e.target.value);
        }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (content.trim() && !submitPending) {
              handleSubmit();
            }
          }
        }}
        placeholder={placeholder ?? placeholderFromContext ?? "留下你的足迹……"}
        className="field-sizing-content min-h-18 w-full flex-1 resize-none bg-transparent px-1 py-0.5 text-sm outline-none"
        disabled={submitPending}
      />

      <InputBoxFooter content={content} submit={handleSubmit} />
    </div>
  );
}

function InputBoxFooter({
  content,
  submit,
}: {
  content: string;
  submit: () => void;
}) {
  const { isPending: submitPending } = useContext(CommentBoxStatusContext);

  return (
    <div className="flex items-center justify-between gap-2 px-1 text-sm text-comment">
      <div className="flex items-center gap-2 text-xs text-comment/90">
        <div className="flex items-center gap-2">支持 Markdown</div>
      </div>
      <div className="flex items-center gap-2">
        <div>{content.length} / 500</div>
        <motion.button
          onClick={() => submit()}
          className="flex items-center gap-0.5 disabled:opacity-50"
          disabled={submitPending || !content.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {submitPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SendIcon className="size-4" />
          )}
          发送
        </motion.button>
      </div>
    </div>
  );
}
