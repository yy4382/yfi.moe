import { useAtom } from "jotai";
import { motion } from "motion/react";
import type { PropsWithChildren } from "react";
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

/**
 * Container for guest users with name/email inputs.
 * Shows login options if not in guest mode.
 */
export function VisitorBox({ children }: PropsWithChildren) {
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
          className="rounded-md border border-container bg-background px-2 py-1 text-sm shadow"
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
    <div className="flex min-h-36 w-full flex-col items-center justify-between gap-2 rounded-sm border border-container bg-card py-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-comment">使用社交账号登录</span>
        <div className="flex gap-2">
          <motion.button
            onClick={() => void handleGitHubLogin()}
            className="flex items-center gap-1 rounded-full border border-container bg-background p-2 shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GitHubIcon className="size-4" />
          </motion.button>

          <MagicLinkDialog>
            <motion.button
              className="flex items-center gap-1 rounded-full border border-container bg-background p-2 shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MailSendLineIcon className="size-4" />
            </motion.button>
          </MagicLinkDialog>
        </div>
      </div>
      <motion.button
        onClick={setAsVisitor}
        className="rounded-full border border-container bg-background px-3 py-1.5 text-sm shadow"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        以游客身份留言
      </motion.button>
    </div>
  );
}
