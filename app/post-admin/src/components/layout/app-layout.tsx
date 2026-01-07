import { FileText, Settings, RefreshCw, LogOut } from "lucide-react";
import { Outlet, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../hooks/use-auth";
import { useGitStatus, useGitSync } from "../../hooks/use-git";
import { Button, Badge, Tooltip, Menu } from "../ui";

export function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: gitStatus } = useGitStatus();
  const { mutate: syncGit, isPending: isSyncing } = useGitSync();

  const changesCount =
    (gitStatus?.modified.length ?? 0) +
    (gitStatus?.created.length ?? 0) +
    (gitStatus?.deleted.length ?? 0);

  const handleSync = () => {
    syncGit(undefined, {
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "posts",
      icon: <FileText className="h-5 w-5" />,
      label: "Posts",
      to: "/",
    },
    {
      key: "settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      to: "/settings",
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white">
        <div className="flex h-14 items-center justify-center border-b border-neutral-200">
          <h1 className="text-base font-semibold text-neutral-900">
            Post Admin
          </h1>
        </div>
        <div className="p-3">
          <Menu items={menuItems} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-neutral-200 bg-white px-6">
          <Tooltip
            title={
              changesCount > 0
                ? `${changesCount} uncommitted changes`
                : "All changes synced"
            }
          >
            <Badge count={changesCount}>
              <Button
                icon={
                  <RefreshCw
                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                }
                onClick={handleSync}
                loading={isSyncing}
              >
                Sync
              </Button>
            </Badge>
          </Tooltip>
          <Button
            variant="ghost"
            icon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-neutral-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
