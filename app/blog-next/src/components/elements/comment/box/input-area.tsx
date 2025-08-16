import { motion } from "motion/react";
import { Loader2Icon, SendIcon, XIcon } from "lucide-react";
import { atom, useAtom, WritableAtom } from "jotai";
import { MutationStatus, useMutationState } from "@tanstack/react-query";

type InputBoxProps = {
  submit: () => void;
  contentAtom: WritableAtom<string, [string], void>;
  isAnonymousAtom?: WritableAtom<boolean, [boolean], void>;
  placeholder?: string | undefined;
  mutationKey: unknown[];

  onCancel?: () => void;
};

export function InputBox({
  submit,
  contentAtom,
  isAnonymousAtom,
  placeholder,
  mutationKey,
  onCancel,
}: InputBoxProps) {
  const [content, setContent] = useAtom(contentAtom);

  const status =
    useMutationState({
      filters: { mutationKey },
      select: (m) => m.state.status,
    }).at(0) ?? "idle";

  return (
    <div className="group border-container focus-within:ring-primary relative flex min-h-36 w-full flex-col justify-between rounded-sm border p-1 focus-within:ring">
      {onCancel && (
        <div className="absolute -top-3 -right-2">
          <motion.button
            onClick={onCancel}
            className="rounded-full bg-zinc-200 p-1 dark:bg-zinc-800"
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
              submit();
            }
          }
        }}
        placeholder={placeholder ?? "留下你的足迹……"}
        className="field-sizing-content min-h-18 w-full flex-1 resize-none bg-transparent px-1 py-0.5 text-sm outline-none"
        disabled={status === "pending"}
      />

      <InputBoxFooter
        content={content}
        submit={submit}
        isAnonymousAtom={isAnonymousAtom}
        status={status}
      />
    </div>
  );
}

const notAnonymousAtom = atom(Symbol("notAnonymous"));
function InputBoxFooter({
  content,
  isAnonymousAtom,
  submit,
  status,
}: {
  content: string;
  isAnonymousAtom?: WritableAtom<boolean, [boolean], void> | undefined;
  submit: () => void;
  status: MutationStatus;
}) {
  const [isAnonymous, setIsAnonymous] = useAtom(
    isAnonymousAtom ?? notAnonymousAtom,
  );

  return (
    <div className="text-comment flex items-center justify-between gap-2 px-1 text-sm">
      <div className="text-comment/90 flex items-center gap-2 text-xs">
        <div className="flex items-center gap-2">支持 Markdown</div>
      </div>
      <div className="flex items-center gap-2">
        <div>{content.length} / 500</div>
        {typeof isAnonymous === "boolean" && (
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span>匿名</span>
          </label>
        )}
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
