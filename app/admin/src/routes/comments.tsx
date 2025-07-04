import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/lib/auth-provider";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/comments")({
  component: CommentsPage,
});

async function fetchComments(path?: string) {
  const url = path
    ? `/api/comments/v1/${encodeURIComponent(path)}`
    : "/api/comments/v1/all";
  const response = await fetch(`http://localhost:3000${url}`);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
}

async function deleteComment(commentId: number) {
  const response = await fetch(
    `http://localhost:3000/api/comments/v1/${commentId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
  return response.json();
}

function CommentsPage() {
  const { user } = useAuth();
  const [selectedPath, setSelectedPath] = useState<string>("");

  // Fetch all comment paths for admin users
  const { data: paths = [] } = useQuery({
    queryKey: ["comment-paths"],
    queryFn: async () => {
      if (user?.role === "admin") {
        // This would need an API endpoint to get all paths with comments
        return []; // For now, return empty array
      }
      return [];
    },
    enabled: user?.role === "admin",
  });

  const { data: comments = [], refetch } = useQuery({
    queryKey: ["comments", selectedPath],
    queryFn: () => fetchComments(selectedPath || undefined),
    enabled: !!user,
  });

  const handleDeleteComment = async (commentId: number) => {
    if (confirm("确定要删除这条评论吗？")) {
      try {
        await deleteComment(commentId);
        refetch();
      } catch (error) {
        alert("删除失败");
      }
    }
  };

  if (!user) {
    return <div>未登录</div>;
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">评论管理</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">所有评论</TabsTrigger>
          {isAdmin && <TabsTrigger value="reported">举报的评论</TabsTrigger>}
          {!isAdmin && <TabsTrigger value="mine">我的评论</TabsTrigger>}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {isAdmin ? "所有评论" : "我的评论"}
                <Badge variant="secondary" className="ml-2">
                  {comments.length} 条
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无评论
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>内容</TableHead>
                      <TableHead>作者</TableHead>
                      <TableHead>页面路径</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments.map((comment: any) => (
                      <TableRow key={comment.id}>
                        <TableCell className="max-w-xs">
                          <div
                            className="prose prose-sm max-w-none truncate"
                            dangerouslySetInnerHTML={{
                              __html: comment.content,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <img
                              src={comment.userImage}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                            <span>{comment.displayName}</span>
                            {comment.isMine && (
                              <Badge variant="outline" className="text-xs">
                                我的
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {isAdmin && (comment as any).path}
                        </TableCell>
                        <TableCell>
                          {new Date(comment.createdAt).toLocaleString("zh-CN")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {(isAdmin || comment.isMine) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="reported" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>举报的评论</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  暂无举报的评论
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {!isAdmin && (
          <TabsContent value="mine" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>我的评论</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  这里显示用户自己的评论
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
