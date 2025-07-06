import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { Github, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.social(
        {
          provider: "github",
          callbackURL: `${window.location.origin}/admin`,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["auth", "session"],
            });
          },
        },
      );

      if (result.error) {
        setError(result.error.message || "登录失败");
      }
    } catch (err) {
      setError("登录过程中发生错误");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">管理员登录</CardTitle>
          <p className="text-center text-muted-foreground">
            使用 GitHub 账号登录管理面板
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            className="flex flex-col items-center space-y-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              <span>{isLoading ? "登录中..." : "使用 GitHub 登录"}</span>
            </Button>
          </motion.div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            <p>只有管理员账号可以访问管理面板</p>
            <p>请确保您的 GitHub 账号已设置为管理员角色</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
