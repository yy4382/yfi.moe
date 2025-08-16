"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/client";
import { MingcuteMailSendLine } from "@/assets/icons/MingcuteMailSendLine";
import { persistentEmailAtom, persistentNameAtom } from "../utils";
import { useAtom } from "jotai";

interface MagicLinkDialogProps {
  children: React.ReactNode;
}

export function MagicLinkDialog({ children }: MagicLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useAtom(persistentEmailAtom);
  const [signupName, setSignupName] = useAtom(persistentNameAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("请输入邮箱地址");
      return;
    }

    setIsLoading(true);
    setSubmittedEmail(email);

    try {
      const { error } = await authClient.signIn.magicLink({
        email: email,
        callbackURL: `${window.location.href}`,
      });

      if (error) {
        toast.error(error.message || "发送邮件失败");
        return;
      }

      setEmailSent(true);
      toast.success("登录链接已发送到您的邮箱！");
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("发送登录链接时出错");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("请输入邮箱地址");
      return;
    }

    if (!signupName) {
      toast.error("请输入昵称");
      return;
    }

    setIsLoading(true);
    setSubmittedEmail(email);

    try {
      const { error } = await authClient.signIn.magicLink({
        email,
        name: signupName,
        callbackURL: `${window.location.href}`,
      });

      if (error) {
        toast.error(error.message || "发送邮件失败");
        return;
      }

      setEmailSent(true);
      toast.success("注册链接已发送到您的邮箱！");

      // Optionally close dialog after a delay
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 3000);
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("发送注册链接时出错");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setSignupName("");
    setEmailSent(false);
    setIsLoading(false);
    setSubmittedEmail("");
    setActiveTab("login");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MingcuteMailSendLine className="size-5" />
            邮箱登录/注册
          </DialogTitle>
          <DialogDescription>
            选择登录已有账户或注册新账户，我们将发送链接到您的邮箱
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {activeTab === "login" ? "登录" : "注册"}链接已发送！
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    请检查您的邮箱 ({submittedEmail}) 并点击链接
                    {activeTab === "login" ? "登录" : "完成注册"}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              如果几分钟内没有收到邮件，请检查垃圾邮件文件夹
            </p>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4 space-y-4">
              <form
                onSubmit={(e) => void handleLoginSubmit(e)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">邮箱地址</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="请输入您的邮箱地址"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      发送中...
                    </div>
                  ) : (
                    "发送登录链接"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4 space-y-4">
              <form
                onSubmit={(e) => void handleSignupSubmit(e)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-name">昵称</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="请输入您的昵称"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">邮箱地址</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="请输入您的邮箱地址"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email || !signupName}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      发送中...
                    </div>
                  ) : (
                    "发送注册链接"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
