import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import { authClient } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  User,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: UserManagement,
});

function UserManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users list (admin only)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const result = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });
      return result.data?.users || [];
    },
    enabled: user?.role === "admin",
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      password: string;
      role: "user" | "admin";
    }) => {
      return authClient.admin.createUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setNewUserDialogOpen(false);
    },
  });

  // Set role mutation
  const setRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "admin";
    }) => {
      return authClient.admin.setRole({ userId, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return authClient.admin.banUser({ userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return authClient.admin.unbanUser({ userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">您没有权限访问此页面</p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u: any) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeUsers = filteredUsers.filter((u: any) => !u.banned);
  const bannedUsers = filteredUsers.filter((u: any) => u.banned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">用户管理</h1>
        <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>创建用户</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新用户</DialogTitle>
            </DialogHeader>
            <CreateUserForm
              onSubmit={(data) => createUserMutation.mutate(data)}
              isLoading={createUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="搜索用户..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            活跃用户
            <Badge variant="secondary" className="ml-2">
              {activeUsers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="banned">
            已禁用
            <Badge variant="destructive" className="ml-2">
              {bannedUsers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <UserTable
            users={activeUsers}
            isLoading={isLoading}
            onSetRole={setRoleMutation.mutate}
            onBanUser={banUserMutation.mutate}
            onUnbanUser={unbanUserMutation.mutate}
            currentUserId={user.id}
          />
        </TabsContent>

        <TabsContent value="banned" className="space-y-4">
          <UserTable
            users={bannedUsers}
            isLoading={isLoading}
            onSetRole={setRoleMutation.mutate}
            onBanUser={banUserMutation.mutate}
            onUnbanUser={unbanUserMutation.mutate}
            currentUserId={user.id}
            showBanned
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateUserForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
  }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">姓名</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">邮箱</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">密码</label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">角色</label>
        <select
          value={formData.role}
          onChange={(e) =>
            setFormData({
              ...formData,
              role: e.target.value as "user" | "admin",
            })
          }
          className="w-full p-2 border rounded-md"
        >
          <option value="user">用户</option>
          <option value="admin">管理员</option>
        </select>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "创建中..." : "创建用户"}
      </Button>
    </form>
  );
}

function UserTable({
  users,
  isLoading,
  onSetRole,
  onBanUser,
  onUnbanUser,
  currentUserId,
  showBanned = false,
}: {
  users: any[];
  isLoading: boolean;
  onSetRole: (data: { userId: string; role: "user" | "admin" }) => void;
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
  currentUserId: string;
  showBanned?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {user.image && (
                      <img
                        src={user.image}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="font-medium">{user.name}</span>
                    {user.id === currentUserId && (
                      <Badge variant="outline">当前用户</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role === "admin" ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        管理员
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        用户
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive">已禁用</Badge>
                  ) : (
                    <Badge variant="default">正常</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell>
                  {user.id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            onSetRole({
                              userId: user.id,
                              role: user.role === "admin" ? "user" : "admin",
                            })
                          }
                        >
                          {user.role === "admin" ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              设为用户
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              设为管理员
                            </>
                          )}
                        </DropdownMenuItem>
                        {showBanned ? (
                          <DropdownMenuItem
                            onClick={() => onUnbanUser(user.id)}
                            className="text-green-600"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            解除禁用
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onBanUser(user.id)}
                            className="text-destructive"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            禁用用户
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {showBanned ? "暂无被禁用的用户" : "暂无用户数据"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
