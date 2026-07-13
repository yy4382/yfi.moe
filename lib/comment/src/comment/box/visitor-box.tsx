import { MaskIcon } from "#/components/ui/mask-icon";
import { getRefetchSessionUrl } from "#/lib/auth/refetch-session-url";
import { useAuthClient } from "#/lib/hooks/context";
import * as stylex from "@stylexjs/stylex";
import { useAtom } from "jotai";
import { motion as Motion } from "motion/react";
import { type PropsWithChildren, useId } from "react";
import { toast } from "sonner";
import {
  colors,
  motion,
  radii,
  shadows,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import {
  persistentAsVisitorAtom,
  persistentEmailAtom,
  persistentNameAtom,
} from "../atoms";
import { MagicLinkDialog } from "./magic-link-dialog";

export function VisitorBox({ children }: PropsWithChildren) {
  const [asVisitor, setAsVisitor] = useAtom(persistentAsVisitorAtom);
  const [visitorName, setVisitorName] = useAtom(persistentNameAtom);
  const [visitorEmail, setVisitorEmail] = useAtom(persistentEmailAtom);
  const nameId = useId();
  const emailId = useId();

  if (!asVisitor) {
    return <VisitorBoxLogin setAsVisitor={() => setAsVisitor(true)} />;
  }

  return (
    <div {...stylex.props(styles.visitorRoot)}>
      <div {...stylex.props(styles.fields)}>
        <label htmlFor={nameId} {...stylex.props(styles.srOnly)}>
          昵称
        </label>
        <input
          id={nameId}
          type="text"
          placeholder="昵称*"
          {...stylex.props(styles.input)}
          value={visitorName}
          onChange={(event) => setVisitorName(event.target.value)}
        />
        <label htmlFor={emailId} {...stylex.props(styles.srOnly)}>
          邮箱
        </label>
        <input
          id={emailId}
          type="email"
          placeholder="邮箱*"
          {...stylex.props(styles.input)}
          value={visitorEmail}
          onChange={(event) => setVisitorEmail(event.target.value)}
        />
        <button
          type="button"
          onClick={() => setAsVisitor(false)}
          {...stylex.props(styles.secondaryButton)}
        >
          登录/注册
        </button>
      </div>
      {children}
    </div>
  );
}

function VisitorBoxLogin({ setAsVisitor }: { setAsVisitor: () => void }) {
  const authClient = useAuthClient();

  const handleGitHubLogin = async () => {
    const callbackURL = getRefetchSessionUrl();
    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: callbackURL.href,
    });
    if (error) toast.error(error.message);
  };

  return (
    <div {...stylex.props(styles.loginPanel)}>
      <div {...stylex.props(styles.loginOptions)}>
        <span {...stylex.props(styles.hint)}>使用社交账号登录</span>
        <div {...stylex.props(styles.socialRow)}>
          <Motion.button
            type="button"
            aria-label="使用 GitHub 登录"
            onClick={() => void handleGitHubLogin()}
            {...stylex.props(styles.socialButton)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MaskIcon name="github-line" stylexStyle={styles.icon} />
          </Motion.button>

          <MagicLinkDialog>
            <Motion.button
              type="button"
              aria-label="使用邮箱登录"
              {...stylex.props(styles.socialButton)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MaskIcon name="mail-send-line" stylexStyle={styles.icon} />
            </Motion.button>
          </MagicLinkDialog>
        </div>
      </div>
      <Motion.button
        type="button"
        onClick={setAsVisitor}
        {...stylex.props(styles.guestButton)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        以游客身份留言
      </Motion.button>
    </div>
  );
}

const styles = stylex.create({
  visitorRoot: { display: "flex", flexDirection: "column", gap: spacing.sm },
  fields: {
    display: "flex",
    gap: spacing.sm,
    justifyContent: "space-between",
    width: "100%",
    "@container (max-width: 28rem)": { flexWrap: "wrap" },
  },
  input: {
    backgroundColor: "transparent",
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors.textPrimary,
    flex: 1,
    minWidth: "8rem",
    outline: "none",
    padding: spacing.xs,
    ":focus": {
      borderColor: colors.focusRing,
      outlineColor: colors.focusRing,
      outlineOffset: "1px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.xs,
    color: colors.textSecondary,
    cursor: "pointer",
    fontSize: typography.sizeSm,
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
  },
  loginPanel: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderDefault,
    borderRadius: radii.sm,
    borderStyle: "solid",
    borderWidth: "1px",
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    justifyContent: "space-between",
    minHeight: "9rem",
    paddingBlock: spacing.lg,
    width: "100%",
  },
  loginOptions: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
  hint: { color: colors.textMuted, fontSize: typography.sizeXs },
  socialRow: { display: "flex", gap: spacing.sm },
  socialButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderDefault,
    borderRadius: radii.round,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.xs,
    color: colors.textPrimary,
    cursor: "pointer",
    display: "flex",
    padding: spacing.sm,
  },
  guestButton: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDefault,
    borderRadius: radii.round,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: shadows.xs,
    color: colors.textPrimary,
    cursor: "pointer",
    fontSize: typography.sizeSm,
    paddingBlock: "0.375rem",
    paddingInline: spacing.md,
    transitionDuration: motion.durationFast,
  },
  icon: { height: "1rem", width: "1rem" },
  srOnly: {
    clipPath: "inset(50%)",
    height: "1px",
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  },
});
