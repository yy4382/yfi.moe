import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { sessionQueryOptions } from "@/lib/auth";

export const Route = createFileRoute("/comments")({
  component: CommentsPage,
});

async function fetchAllComments(limit: number, offset: number) {
  const response = await fetch(`/api/comments/v1/getComments/all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      limit,
      offset,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return response.json();
}

async function deleteComment(commentId: number) {
  const response = await fetch(`/api/comments/v1/deleteComment`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ id: commentId }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
  return response.json();
}

function CommentsPage() {
  const authData = useQuery(sessionQueryOptions);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const user = authData.data?.user;

  const {
    data: comments = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["auth", "session", "all-comments", page],
    queryFn: () => fetchAllComments(pageSize, page * pageSize),
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

  const canDelete = (comment: any) => {
    if (!user) return false;
    // Admin 可以删除所有评论，普通用户只能删除自己的评论
    return user.role === "admin" || comment.isMine;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">未登录</h2>
          <p className="text-muted-foreground">请先登录以查看评论管理页面</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">评论管理</h1>
        <Badge variant="secondary">
          {user.role === "admin" ? "管理员" : "用户"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            所有评论
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {comments.length} 条
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>加载中...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无评论
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>内容</TableHead>
                    <TableHead>作者</TableHead>
                    <TableHead>页面路径</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment: any) => (
                    <TableRow key={comment.id}>
                      <TableCell className="max-w-xs">
                        <div
                          className="prose prose-sm max-w-none line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: comment.content,
                          }}
                        />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center space-x-2">
                          <img
                            src={comment.userImage}
                            alt=""
                            className="w-6 h-6 rounded-full flex-shrink-0"
                          />
                          <span className="text-sm truncate min-w-0">
                            {comment.displayName}
                          </span>
                          {comment.isMine && (
                            <Badge
                              variant="outline"
                              className="text-xs flex-shrink-0"
                            >
                              我的
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {comment.path || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(comment.createdAt).toLocaleString("zh-CN")}
                      </TableCell>
                      <TableCell>
                        {canDelete(comment) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页控件 */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  第 {page + 1} 页，每页 {pageSize} 条
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={comments.length < pageSize}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
