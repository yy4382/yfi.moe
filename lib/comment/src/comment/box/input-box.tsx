import { MaskIcon } from "#/components/ui/mask-icon";
import * as stylex from "@stylexjs/stylex";
import { type MutationStatus, useMutationState } from "@tanstack/react-query";
import { useAtom, type WritableAtom } from "jotai";
import { useId } from "react";
import {
  colors,
  motion,
  radii,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import { COMMENT_MAX_LENGTH } from "../utils/constants";

interface InputBoxProps {
  submit: () => void;
  contentAtom: WritableAtom<string, [string], void>;
  isAnonymousAtom?: WritableAtom<boolean, [boolean], void>;
  placeholder?: string;
  mutationKey: readonly unknown[];
  onCancel?: () => void;
  submitLabel?: string;
}

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
      select: (mutation) => mutation.state.status,
    }).at(0) ?? "idle";

  return (
    <div {...stylex.props(styles.root)}>
      {onCancel && (
        <div {...stylex.props(styles.cancelPosition)}>
          <button
            type="button"
            aria-label="取消编辑"
            onClick={onCancel}
            {...stylex.props(styles.cancelButton)}
          >
            <MaskIcon name="close-line" stylexStyle={styles.iconSmall} />
          </button>
        </div>
      )}

      <label htmlFor={textareaId} {...stylex.props(styles.srOnly)}>
        评论内容
      </label>
      <textarea
        id={textareaId}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            if (content.trim() && status !== "pending") submit();
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
      <span {...stylex.props(styles.markdownHint)}>支持 Markdown</span>
      <div {...stylex.props(styles.footerActions)}>
        <span>
          {content.length} / {COMMENT_MAX_LENGTH}
        </span>
        {isAnonymousAtom && <AnonymousCheckbox atom={isAnonymousAtom} />}
        <button
          type="button"
          aria-label={submitLabel}
          onClick={submit}
          {...stylex.props(styles.sendButton)}
          disabled={status === "pending" || !content.trim()}
        >
          <MaskIcon
            name={status === "pending" ? "loading-line" : "send-plane-line"}
            stylexStyle={[styles.icon, status === "pending" && styles.spin]}
          />
          发送
        </button>
      </div>
    </div>
  );
}

function AnonymousCheckbox({
  atom,
}: {
  atom: WritableAtom<boolean, [boolean], void>;
}) {
  const [isAnonymous, setIsAnonymous] = useAtom(atom);
  return (
    <label {...stylex.props(styles.checkbox)}>
      <input
        type="checkbox"
        checked={isAnonymous}
        onChange={(event) => setIsAnonymous(event.target.checked)}
      />
      <span>匿名</span>
    </label>
  );
}

const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

const styles = stylex.create({
  root: {
    borderColor: colors.borderDefault,
    borderRadius: radii.sm,
    borderStyle: "solid",
    borderWidth: "1px",
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "9rem",
    padding: spacing.xs,
    position: "relative",
    transitionDuration: motion.durationFast,
    transitionProperty: "border-color, box-shadow",
    width: "100%",
    ":focus-within": {
      borderColor: colors.focusRing,
      outlineColor: colors.focusRing,
      outlineOffset: "1px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  },
  cancelPosition: {
    position: "absolute",
    right: "-0.5rem",
    top: "-0.75rem",
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    border: 0,
    borderRadius: radii.round,
    cursor: "pointer",
    display: "flex",
    padding: spacing.xs,
    transitionDuration: motion.durationFast,
    transitionProperty: "transform",
    ":hover": { transform: "scale(1.05)" },
    ":active": { transform: "scale(0.95)" },
  },
  textarea: {
    backgroundColor: "transparent",
    border: 0,
    color: colors.textPrimary,
    fieldSizing: "content",
    flex: 1,
    fontSize: typography.sizeSm,
    minHeight: "4.5rem",
    outline: "none",
    paddingBlock: spacing.xxs,
    paddingInline: spacing.xs,
    resize: "none",
    width: "100%",
    "::placeholder": { color: colors.textMuted },
  },
  footer: {
    alignItems: "center",
    color: colors.textMuted,
    display: "flex",
    fontSize: typography.sizeSm,
    gap: spacing.sm,
    justifyContent: "space-between",
    paddingInline: spacing.xs,
  },
  markdownHint: {
    fontSize: typography.sizeXs,
    "@container (max-width: 20rem)": { display: "none" },
  },
  footerActions: {
    alignItems: "center",
    display: "flex",
    gap: spacing.sm,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    border: 0,
    color: colors.textSecondary,
    cursor: "pointer",
    display: "flex",
    gap: spacing.xxs,
    padding: 0,
    transitionDuration: motion.durationFast,
    transitionProperty: "color, opacity, transform",
    ":hover": { color: colors.accentText, transform: "scale(1.05)" },
    ":active": { transform: "scale(0.95)" },
    ":disabled": { cursor: "not-allowed", opacity: 0.5 },
  },
  checkbox: { alignItems: "center", display: "flex", gap: spacing.xs },
  icon: { height: "1rem", width: "1rem" },
  iconSmall: { height: "0.75rem", width: "0.75rem" },
  spin: {
    animationDuration: "800ms",
    animationIterationCount: "infinite",
    animationName: spin,
    animationTimingFunction: "linear",
  },
  srOnly: {
    clip: "rect(0, 0, 0, 0)",
    clipPath: "inset(50%)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  },
});
