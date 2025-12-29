import {
  FileTextOutlined,
  SettingOutlined,
  SyncOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, Badge, Tooltip, App } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/use-auth";
import { useGitStatus, useGitSync } from "../../hooks/use-git";

const { Header, Sider, Content } = Layout;

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { data: gitStatus } = useGitStatus();
  const { mutate: syncGit, isPending: isSyncing } = useGitSync();
  const { message } = App.useApp();

  const changesCount =
    (gitStatus?.modified.length ?? 0) +
    (gitStatus?.created.length ?? 0) +
    (gitStatus?.deleted.length ?? 0);

  const handleSync = () => {
    syncGit(undefined, {
      onSuccess: (data) => {
        message.success(data.message);
      },
      onError: (error) => {
        message.error(error.message);
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/",
      icon: <FileTextOutlined />,
      label: "Posts",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider theme="light" className="border-r border-gray-200">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-lg font-semibold">Post Admin</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-none"
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-end gap-4 border-b border-gray-200 bg-white px-6">
          <Tooltip
            title={
              changesCount > 0
                ? `${changesCount} uncommitted changes`
                : "All changes synced"
            }
          >
            <Badge count={changesCount} size="small">
              <Button
                icon={<SyncOutlined spin={isSyncing} />}
                onClick={handleSync}
                loading={isSyncing}
              >
                Sync
              </Button>
            </Badge>
          </Tooltip>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Header>
        <Content className="bg-gray-50 p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
