import {
  Outlet,
  createRootRoute,
  Link,
  useLocation,
  Navigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Users, MessageSquare } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient, sessionQueryOptions } from "@/lib/auth";

function RootLayout() {
  const location = useLocation();
  const authData = useQuery(sessionQueryOptions);
  const queryClient = useQueryClient();
  const user = authData.data?.user;

  // Allow access to login page without authentication check
  const isLoginPage = location.pathname === "/admin/login";

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["auth", "session"],
          });
        },
      },
    });
  };

  if (authData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If on login page, render it directly without auth checks
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    );
  }

  // For all other pages, check authentication
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user is admin
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">访问被拒绝</h1>
            <p className="text-muted-foreground mb-4">
              您没有访问管理面板的权限
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                当前角色: {user.role || "无"}
              </p>
              <Button onClick={handleSignOut} variant="outline">
                退出登录
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold">管理面板</h1>
            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-sm font-medium transition-colors hover:text-primary"
                activeProps={{
                  className: "text-primary",
                }}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>用户管理</span>
                </div>
              </Link>
              <Link
                to="/comments"
                className="text-sm font-medium transition-colors hover:text-primary"
                activeProps={{
                  className: "text-primary",
                }}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>评论管理</span>
                </div>
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              欢迎，{user.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>退出</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
