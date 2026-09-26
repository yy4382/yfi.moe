import * as stylex from "@stylexjs/stylex";
import { useAtom } from "jotai";
import { motion } from "motion/react";
import { type PropsWithChildren, useId } from "react";
import { toast } from "sonner";
import GitHubIcon from "~icons/mingcute/github-line";
import MailSendLineIcon from "~icons/mingcute/mail-send-line";
import { getRefetchSessionUrl } from "@/lib/auth/refetch-session-url";
import { useAuthClient } from "@/lib/hooks/context";
import {
  persistentAsVisitorAtom,
  persistentEmailAtom,
  persistentNameAtom,
} from "../atoms";
import { MagicLinkDialog } from "./magic-link-dialog";
import { styles } from "./visitor-box.stylex";

/**
 * Container for guest users with name/email inputs.
 * Shows login options if not in guest mode.
 */
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
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.fields)}>
        <label htmlFor={nameId} {...stylex.props(styles.visuallyHidden)}>
          昵称
        </label>
        <input
          id={nameId}
          type="text"
          placeholder="昵称*"
          {...stylex.props(styles.input)}
          value={visitorName}
          onChange={(e) => setVisitorName(e.target.value)}
        />
        <label htmlFor={emailId} {...stylex.props(styles.visuallyHidden)}>
          邮箱
        </label>
        <input
          id={emailId}
          type="email"
          placeholder="邮箱*"
          {...stylex.props(styles.input)}
          value={visitorEmail}
          onChange={(e) => setVisitorEmail(e.target.value)}
        />
        <button
          onClick={() => setAsVisitor(false)}
          {...stylex.props(styles.loginButton)}
        >
          登录/注册
        </button>
      </div>
      {children}
    </div>
  );
}

interface VisitorBoxLoginProps {
  setAsVisitor: () => void;
}

/**
 * Login options for guests (GitHub, magic link, or continue as visitor).
 */
function VisitorBoxLogin({ setAsVisitor }: VisitorBoxLoginProps) {
  const authClient = useAuthClient();

  const handleGitHubLogin = async () => {
    const callbackURL = getRefetchSessionUrl();
    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: callbackURL.href,
    });
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div {...stylex.props(styles.login)}>
      <div {...stylex.props(styles.loginMethods)}>
        <span {...stylex.props(styles.hint)}>使用社交账号登录</span>
        <div {...stylex.props(styles.providers)}>
          <motion.button
            onClick={() => void handleGitHubLogin()}
            {...stylex.props(styles.providerButton)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GitHubIcon {...stylex.props(styles.providerIcon)} />
          </motion.button>

          <MagicLinkDialog>
            <motion.button
              {...stylex.props(styles.providerButton)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MailSendLineIcon {...stylex.props(styles.providerIcon)} />
            </motion.button>
          </MagicLinkDialog>
        </div>
      </div>
      <motion.button
        onClick={setAsVisitor}
        {...stylex.props(styles.visitorButton)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        以游客身份留言
      </motion.button>
    </div>
  );
}
