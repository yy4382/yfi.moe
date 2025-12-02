import { type MutationStatus, useMutationState } from "@tanstack/react-query";
import { atom, useAtom, type WritableAtom } from "jotai";
import MingcuteCloseLine from "~icons/mingcute/close-line";
import MingcuteLoadingLine from "~icons/mingcute/loading-line";
import MingcuteSendPlaneLine from "~icons/mingcute/send-plane-line";

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
    <div className="group @container relative flex min-h-36 w-full flex-col justify-between rounded-sm border border-container p-1 focus-within:ring focus-within:ring-primary">
      {onCancel && (
        <div className="absolute -top-3 -right-2">
          <button
            onClick={onCancel}
            className="rounded-full bg-zinc-200 p-1 hover:scale-105 active:scale-95 dark:bg-zinc-800"
          >
            <MingcuteCloseLine className="size-3" />
          </button>
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
    <div className="flex items-center justify-between gap-2 px-1 text-sm text-comment">
      <div className="flex items-center gap-2 text-xs text-comment/90">
        <div className="flex items-center gap-2 @max-2xs:hidden">
          支持 Markdown
        </div>
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
        <button
          onClick={() => submit()}
          className="flex items-center gap-0.5 hover:scale-105 active:scale-95 disabled:opacity-50"
          disabled={status === "pending" || !content.trim()}
        >
          {status === "pending" ? (
            <MingcuteLoadingLine className="size-4 animate-spin" />
          ) : (
            <MingcuteSendPlaneLine className="size-4" />
          )}
          发送
        </button>
      </div>
    </div>
  );
}
