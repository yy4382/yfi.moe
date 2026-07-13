"use client";

import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { MaskIcon } from "#/components/ui/mask-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { getRefetchSessionUrl } from "#/lib/auth/refetch-session-url";
import { useAuthClient } from "#/lib/hooks/context";
import * as stylex from "@stylexjs/stylex";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  colors,
  radii,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import { persistentEmailAtom, persistentNameAtom } from "../atoms";
import { DIALOG_CLOSE_DELAY } from "../utils/constants";

interface MagicLinkDialogProps {
  children: React.ReactNode;
}

type AuthMode = "login" | "signup";

export function MagicLinkDialog({ children }: MagicLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useAtom(persistentEmailAtom);
  const [signupName, setSignupName] = useAtom(persistentNameAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthMode>("login");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const authClient = useAuthClient();

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const resetForm = () => {
    clearTimeout(closeTimer.current);
    setEmail("");
    setSignupName("");
    setEmailSent(false);
    setIsLoading(false);
    setSubmittedEmail("");
    setActiveTab("login");
  };

  const handleMagicLink = async (mode: AuthMode) => {
    if (!email) {
      toast.error("请输入邮箱地址");
      return;
    }
    if (mode === "signup" && !signupName) {
      toast.error("请输入昵称");
      return;
    }

    setIsLoading(true);
    setSubmittedEmail(email);
    try {
      const callbackURL = getRefetchSessionUrl();
      const { error } = await authClient.signIn.magicLink({
        email,
        ...(mode === "signup" && { name: signupName }),
        callbackURL: callbackURL.href,
      });
      if (error) {
        toast.error(error.message || "发送邮件失败");
        return;
      }

      setEmailSent(true);
      toast.success(mode === "login" ? "登录链接已发送！" : "注册链接已发送！");
      if (mode === "signup") {
        closeTimer.current = setTimeout(() => {
          setOpen(false);
          resetForm();
        }, DIALOG_CLOSE_DELAY);
      }
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error(
        mode === "login" ? "发送登录链接时出错" : "发送注册链接时出错",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent stylexStyle={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle stylexStyle={styles.title}>
            <MaskIcon name="mail-send-line" stylexStyle={styles.titleIcon} />
            邮箱登录/注册
          </DialogTitle>
          <DialogDescription>
            选择登录已有账户或注册新账户，我们将发送链接到您的邮箱
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <EmailSentMessage mode={activeTab} email={submittedEmail} />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AuthMode)}
            stylexStyle={styles.fullWidth}
          >
            <TabsList stylexStyle={styles.tabList}>
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login" stylexStyle={styles.tabContent}>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleMagicLink("login");
                }}
                {...stylex.props(styles.form)}
              >
                <EmailField
                  id="login-email"
                  value={email}
                  onChange={setEmail}
                  disabled={isLoading}
                />
                <SubmitButton
                  isLoading={isLoading}
                  disabled={!email}
                  label="发送登录链接"
                />
              </form>
            </TabsContent>

            <TabsContent value="signup" stylexStyle={styles.tabContent}>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleMagicLink("signup");
                }}
                {...stylex.props(styles.form)}
              >
                <div {...stylex.props(styles.field)}>
                  <Label htmlFor="signup-name">昵称</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="请输入您的昵称"
                    value={signupName}
                    onChange={(event) => setSignupName(event.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <EmailField
                  id="signup-email"
                  value={email}
                  onChange={setEmail}
                  disabled={isLoading}
                />
                <SubmitButton
                  isLoading={isLoading}
                  disabled={!email || !signupName}
                  label="发送注册链接"
                />
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmailField({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div {...stylex.props(styles.field)}>
      <Label htmlFor={id}>邮箱地址</Label>
      <Input
        id={id}
        type="email"
        placeholder="请输入您的邮箱地址"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        disabled={disabled}
      />
    </div>
  );
}

function SubmitButton({
  isLoading,
  disabled,
  label,
}: {
  isLoading: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <Button
      type="submit"
      stylexStyle={styles.fullWidth}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <span {...stylex.props(styles.loadingLabel)}>
          <span {...stylex.props(styles.spinner)} />
          发送中...
        </span>
      ) : (
        label
      )}
    </Button>
  );
}

function EmailSentMessage({ mode, email }: { mode: AuthMode; email: string }) {
  const modeText = mode === "login" ? "登录" : "注册";
  return (
    <div {...stylex.props(styles.sentRoot)}>
      <div {...stylex.props(styles.sentPanel)}>
        <div {...stylex.props(styles.sentRow)}>
          <MaskIcon name="check-line" stylexStyle={styles.sentIcon} />
          <div>
            <p {...stylex.props(styles.sentTitle)}>{modeText}链接已发送！</p>
            <p {...stylex.props(styles.sentDescription)}>
              请检查您的邮箱 ({email}) 并点击链接
              {mode === "login" ? "登录" : "完成注册"}
            </p>
          </div>
        </div>
      </div>
      <p {...stylex.props(styles.help)}>
        如果几分钟内没有收到邮件，请检查垃圾邮件文件夹
      </p>
    </div>
  );
}

const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

const styles = stylex.create({
  dialogContent: { maxWidth: "28rem" },
  title: { alignItems: "center", display: "flex", gap: spacing.sm },
  titleIcon: { height: "1.25rem", width: "1.25rem" },
  fullWidth: { width: "100%" },
  tabList: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    width: "100%",
  },
  tabContent: { marginTop: spacing.lg },
  form: { display: "flex", flexDirection: "column", gap: spacing.lg },
  field: { display: "flex", flexDirection: "column", gap: spacing.sm },
  loadingLabel: { alignItems: "center", display: "flex", gap: spacing.sm },
  spinner: {
    animationDuration: "800ms",
    animationIterationCount: "infinite",
    animationName: spin,
    animationTimingFunction: "linear",
    borderColor: colors.textOnAccent,
    borderRadius: radii.round,
    borderStyle: "solid",
    borderTopColor: "transparent",
    borderWidth: "2px",
    height: "1rem",
    width: "1rem",
  },
  sentRoot: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    textAlign: "center",
  },
  sentPanel: {
    backgroundColor: colors.successSurface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  sentRow: { alignItems: "center", display: "flex", justifyContent: "center" },
  sentIcon: {
    color: colors.success,
    flexShrink: 0,
    height: "1.25rem",
    marginInlineEnd: spacing.md,
    width: "1.25rem",
  },
  sentTitle: {
    color: colors.success,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
  },
  sentDescription: { color: colors.textSecondary, fontSize: typography.sizeSm },
  help: { color: colors.textMuted, fontSize: typography.sizeSm },
});
