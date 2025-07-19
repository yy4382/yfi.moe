import type { UserInfo } from "@waline/api";
import { addComment, login, updateComment } from "@waline/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { userInfoAtom, userInfoSchema, YulineContext } from "./utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import { Loader2Icon, SendIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import z from "zod";
import { toast } from "sonner";

type CommentBoxId = {
  parentId?: number;
  replyingTo?: number;
  editId?: number;
  url: string;
};

const CommentBoxIdContext = createContext<CommentBoxId>({ url: "" });

type CommentBoxStatus = {
  isPending: boolean;
  isSuccess: boolean;
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
    userInfo: userInfoSchema,
    content: commentContentSchema,
  })
  .brand("userAddComment");
const visitorAddCommentSchema = z
  .object({
    content: commentContentSchema,
    nick: z.string().min(1, "昵称不能为空"),
    mail: z.email("邮箱格式不正确"),
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
  const { serverURL, lang, url, ua } = useContext(YulineContext);
  const userInfo = useAtomValue(userInfoAtom);
  const queryClient = useQueryClient();

  const { isPending, mutate, isSuccess, reset } = useMutation({
    mutationFn: async (...args: Parameters<typeof addComment>) => {
      const resp = await addComment(...args);
      if (resp.errno !== 0 || !resp.data) {
        toast.error(resp.errmsg);
        throw new Error(resp.errmsg);
      }
      return resp.data;
    },
    onSuccess: () => {
      onSuccess?.();
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

  const handleUserSubmit = (data: z.infer<typeof userAddCommentSchema>) => {
    mutate({
      serverURL,
      lang,
      token: data.userInfo.token,
      comment: {
        comment: data.content,
        nick: data.userInfo.display_name,
        mail: data.userInfo.email,
        link: data.userInfo.url,
        ua,
        url,
        ...reply,
      },
    });
  };

  const handleVisitorSubmit = (
    data: z.infer<typeof visitorAddCommentSchema>,
  ) => {
    mutate({
      serverURL,
      lang,
      comment: {
        comment: data.content,
        nick: data.nick,
        mail: data.mail,
        ua,
        url,
        ...reply,
      },
    });
  };

  return (
    <CommentBoxIdContext
      value={{ parentId: reply?.pid, replyingTo: reply?.rid, url }}
    >
      <CommentBoxStatusContext
        value={{ isPending, isSuccess, reset, cancel: reply?.onCancel }}
      >
        {userInfo ? (
          <UserBox submit={handleUserSubmit} userInfo={userInfo} />
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
  userInfo,
  onCancel,
  onSuccess,
}: {
  editId: number;
  initialContent: string;
  userInfo: UserInfo;
  onCancel: () => void;
  onSuccess?: () => void;
}) {
  const { serverURL, lang, url } = useContext(YulineContext);
  const queryClient = useQueryClient();
  const { isPending, isSuccess, mutate, reset } = useMutation({
    mutationFn: async (content: z.infer<typeof commentContentSchema>) => {
      const resp = await updateComment({
        serverURL,
        lang,
        token: userInfo.token,
        objectId: editId,
        comment: { comment: content },
      });
      if (resp.errno !== 0 || !resp.data) {
        toast.error(resp.errmsg);
        throw new Error(resp.errmsg);
      }
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "comments",
          { serverURL, lang },
          { token: userInfo.token },
          url,
        ],
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
    <CommentBoxIdContext value={{ editId, url }}>
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
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const setUserInfo = useSetAtom(userInfoAtom);

  const config = useContext(YulineContext);

  async function handleSignIn() {
    const data = await login(config);
    setUserInfo(data, data.remember);
  }

  const handleSubmit = useCallback(
    (content: string) => {
      const parsed = visitorAddCommentSchema.safeParse({
        content,
        nick: visitorName,
        mail: visitorEmail,
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
          onClick={handleSignIn}
          className="rounded-md border border-container bg-bg px-2 py-1 text-sm shadow"
        >
          登录/注册
        </button>
      </div>
      <InputBox
        submit={handleSubmit}
        placeholder="注册后可以编辑、删除评论，并且通过邮件获取回复通知哦"
      />
    </div>
  );
}

type UserBoxProps = {
  submit: (data: z.infer<typeof userAddCommentSchema>) => void;
  userInfo: UserInfo;
};
function UserBox({ submit, userInfo }: UserBoxProps) {
  const handleSubmit = useCallback(
    (content: string) => {
      const parsed = userAddCommentSchema.safeParse({ content, userInfo });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        console.warn(parsed.error);
        return;
      }
      submit(parsed.data);
    },
    [userInfo, submit],
  );
  const setUserInfo = useSetAtom(userInfoAtom);

  const handleSignOut = useCallback(() => {
    setUserInfo(null);
  }, [setUserInfo]);

  return (
    <div className="flex w-full items-end gap-4">
      <div className="group relative mb-2 flex-shrink-0">
        <Image
          src={userInfo.avatar}
          alt={userInfo.display_name}
          width={56}
          height={56}
          unoptimized
          className="aspect-square size-14 rounded-full ring-2 ring-black dark:ring-white"
        />
        <div className="absolute -top-1 -right-1 z-10 hidden size-4 rounded-md bg-gray-500/50 p-0.5 group-hover:block">
          <button
            onClick={handleSignOut} // TODO invalidate queries
            className="flex size-full items-center justify-center"
          >
            <XIcon className="size-2.5" />
          </button>
        </div>
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
            className="rounded-full bg-gray-200 p-1"
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
        placeholder={placeholder ?? "留下你的足迹……"}
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
