import * as stylex from "@stylexjs/stylex";
import { type MutationStatus, useMutationState } from "@tanstack/react-query";
import { useAtom, type WritableAtom } from "jotai";
import { useId } from "react";
import MingcuteCloseLine from "~icons/mingcute/close-line";
import MingcuteLoadingLine from "~icons/mingcute/loading-line";
import MingcuteSendPlaneLine from "~icons/mingcute/send-plane-line";
import { COMMENT_MAX_LENGTH } from "../utils/constants";
import { styles } from "./input-box.stylex";

interface InputBoxProps {
  submit: () => void;
  contentAtom: WritableAtom<string, [string], void>;
  isAnonymousAtom?: WritableAtom<boolean, [boolean], void>;
  placeholder?: string;
  mutationKey: readonly unknown[];
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * Shared input textarea for new comments and edits.
 *
 * Features:
 * - Markdown support indicator
 * - Character count
 * - Optional anonymous checkbox
 * - Keyboard shortcut (Ctrl/Cmd+Enter to submit)
 * - Loading state during submission
 */
export function InputBox({
  submit,
  contentAtom,
  isAnonymousAtom,
  placeholder,
  mutationKey,
  onCancel,
  submitLabel = "发送评论",
}: InputBoxProps) {
  const [content, setContent] = useAtom(contentAtom);
  const textareaId = useId();

  const status =
    useMutationState({
      filters: { mutationKey },
      select: (m) => m.state.status,
    }).at(0) ?? "idle";

  return (
    <div {...stylex.props(styles.root)}>
      {onCancel && (
        <div {...stylex.props(styles.cancelPosition)}>
          <button
            aria-label="取消编辑"
            onClick={onCancel}
            {...stylex.props(styles.cancelButton)}
          >
            <MingcuteCloseLine {...stylex.props(styles.cancelIcon)} />
          </button>
        </div>
      )}

      <label htmlFor={textareaId} {...stylex.props(styles.visuallyHidden)}>
        评论内容
      </label>
      <textarea
        id={textareaId}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (content.trim() && status !== "pending") {
              submit();
            }
          }
        }}
        placeholder={placeholder ?? "留下你的足迹……"}
        {...stylex.props(styles.textarea)}
        disabled={status === "pending"}
      />

      <InputBoxFooter
        content={content}
        submit={submit}
        isAnonymousAtom={isAnonymousAtom}
        status={status}
        submitLabel={submitLabel}
      />
    </div>
  );
}

interface InputBoxFooterProps {
  content: string;
  submit: () => void;
  isAnonymousAtom?: WritableAtom<boolean, [boolean], void>;
  status: MutationStatus;
  submitLabel: string;
}

function InputBoxFooter({
  content,
  isAnonymousAtom,
  submit,
  status,
  submitLabel,
}: InputBoxFooterProps) {
  return (
    <div {...stylex.props(styles.footer)}>
      <div {...stylex.props(styles.footerHint)}>
        <div {...stylex.props(styles.markdownHint)}>支持 Markdown</div>
      </div>
      <div {...stylex.props(styles.actions)}>
        <div>
          {content.length} / {COMMENT_MAX_LENGTH}
        </div>
        {isAnonymousAtom && <AnonymousCheckbox atom={isAnonymousAtom} />}
        <button
          aria-label={submitLabel}
          onClick={() => submit()}
          {...stylex.props(styles.submit)}
          disabled={status === "pending" || !content.trim()}
        >
          {status === "pending" ? (
            <MingcuteLoadingLine
              {...stylex.props(styles.actionIcon, styles.loadingIcon)}
            />
          ) : (
            <MingcuteSendPlaneLine {...stylex.props(styles.actionIcon)} />
          )}
          发送
        </button>
      </div>
    </div>
  );
}

interface AnonymousCheckboxProps {
  atom: WritableAtom<boolean, [boolean], void>;
}

function AnonymousCheckbox({ atom }: AnonymousCheckboxProps) {
  const [isAnonymous, setIsAnonymous] = useAtom(atom);

  return (
    <label {...stylex.props(styles.anonymous)}>
      <input
        type="checkbox"
        checked={isAnonymous}
        onChange={(e) => setIsAnonymous(e.target.checked)}
      />
      <span>匿名</span>
    </label>
  );
}
