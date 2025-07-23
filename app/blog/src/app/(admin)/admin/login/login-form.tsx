"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GithubIcon from "@/assets/icons/MingcuteGithubLine";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionOptions } from "@/components/elements/comment/utils";
import z from "zod";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const redirectUrl = decodeURIComponent(
    searchParams.get("redirectUrl") ||
      (typeof window !== "undefined" ? window.location.origin + "/admin" : ""),
  );

  // redirect if already logged in
  const { data: session } = useQuery(sessionOptions());
  if (session) {
    router.push(redirectUrl);
  }

  const handleGithubLogin = () => {
    authClient.signIn.social(
      {
        provider: "github",
        callbackURL: redirectUrl,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(sessionOptions());
        },
      },
    );
  };
  const handleGoogleLogin = () => {
    throw new Error("Not implemented yet");
    authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirectUrl,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(sessionOptions());
        },
      },
    );
  };
  const handleSubmit = async (data: FormData) => {
    console.info(data);
    const email = data.get("email");
    const password = data.get("password");
    console.info(email, password);
    const parsed = z
      .object({
        email: z.email(),
        password: z.string().min(6),
      })
      .safeParse({ email, password });
    if (!parsed.success) {
      toast.error("Invalid email or password");
      return;
    }
    const res = await authClient.signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    queryClient.invalidateQueries(sessionOptions());
    toast.success("Login successful");
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">欢迎回来</CardTitle>
          <CardDescription>使用您的 GitHub 或 Google 账户登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGithubLogin}
                >
                  <GithubIcon className="size-4" />
                  使用 GitHub 登录
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  使用 Google 登录
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  或者继续使用
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">密码</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      忘记密码？
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full">
                  登录
                </Button>
              </div>
              <div className="text-center text-sm">
                还没有账户？{" "}
                <a href="#" className="underline underline-offset-4">
                  注册
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        点击继续，您同意我们的 <a href="#">服务条款</a> 和{" "}
        <a href="#">隐私政策</a>。
      </div> */}
    </div>
  );
}
