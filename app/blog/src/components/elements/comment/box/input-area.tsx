import { useCallback, useContext, useState } from "react";
import { CommentBoxStatusContext, WithSuccess } from "./context";
import { motion } from "motion/react";
import { Loader2Icon, SendIcon, XIcon } from "lucide-react";

type InputBoxProps = {
  submit: WithSuccess<(data: string) => void>;
  initialContent?: string;
  placeholder?: string;
};
export function InputBox({
  submit,
  initialContent,
  placeholder,
}: InputBoxProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const {
    status,
    reset,
    cancel,
    placeholder: placeholderFromContext,
  } = useContext(CommentBoxStatusContext);

  const handleSubmit = useCallback(() => {
    submit(content, {
      onSuccess: () => {
        setContent("");
        reset();
      },
    });
  }, [content, reset, submit]);

  return (
    <div className="group border-container focus-within:ring-primary relative flex min-h-36 w-full flex-col justify-between rounded-sm border p-1 focus-within:ring">
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
          setContent(e.target.value);
        }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (content.trim() && status !== "pending") {
              handleSubmit();
            }
          }
        }}
        placeholder={placeholder ?? placeholderFromContext ?? "留下你的足迹……"}
        className="field-sizing-content min-h-18 w-full flex-1 resize-none bg-transparent px-1 py-0.5 text-sm outline-none"
        disabled={status === "pending"}
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
  const { status } = useContext(CommentBoxStatusContext);

  return (
    <div className="text-comment flex items-center justify-between gap-2 px-1 text-sm">
      <div className="text-comment/90 flex items-center gap-2 text-xs">
        <div className="flex items-center gap-2">支持 Markdown</div>
      </div>
      <div className="flex items-center gap-2">
        <div>{content.length} / 500</div>
        <motion.button
          onClick={() => submit()}
          className="flex items-center gap-0.5 disabled:opacity-50"
          disabled={status === "pending" || !content.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {status === "pending" ? (
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
