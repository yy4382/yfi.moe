import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button, Tag, Input, Table, ConfirmDialog } from "../components/ui";
import { usePosts, useDeletePost } from "../hooks/use-posts";
import type { PostListItem } from "../types/post";

export function PostsListPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const [searchText, setSearchText] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const filteredPosts = posts?.filter(
    (post) =>
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchText.toLowerCase()),
      ),
  );

  const handleDelete = (slug: string) => {
    deletePost(slug, {
      onSuccess: () => {
        toast.success("Post deleted");
        setDeleteSlug(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const columns = [
    {
      key: "title",
      title: "Title",
      render: (record: PostListItem) => (
        <button
          onClick={() => navigate(`/posts/${record.slug}`)}
          className="text-left font-medium text-neutral-900 transition-colors hover:text-neutral-600"
        >
          {record.title}
        </button>
      ),
    },
    {
      key: "date",
      title: "Date",
      width: 120,
      render: (record: PostListItem) =>
        new Date(record.date).toLocaleDateString(),
    },
    {
      key: "status",
      title: "Status",
      width: 100,
      render: (record: PostListItem) => (
        <Tag color={record.published ? "success" : "warning"}>
          {record.published ? "Published" : "Draft"}
        </Tag>
      ),
    },
    {
      key: "tags",
      title: "Tags",
      render: (record: PostListItem) => (
        <div className="flex flex-wrap gap-1">
          {record.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {record.tags.length > 3 && <Tag>+{record.tags.length - 3}</Tag>}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: 100,
      render: (record: PostListItem) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => navigate(`/posts/${record.slug}`)}
          />
          <ConfirmDialog
            open={deleteSlug === record.slug}
            onOpenChange={(open) => setDeleteSlug(open ? record.slug : null)}
            title="Delete post?"
            description="This action cannot be undone."
            confirmText="Delete"
            danger
            onConfirm={() => handleDelete(record.slug)}
          >
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="h-4 w-4 text-red-500" />}
            />
          </ConfirmDialog>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Posts</h1>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => navigate("/posts/new")}
        >
          New Post
        </Button>
      </div>
      <div className="mb-4">
        <Input
          placeholder="Search by title or tag..."
          icon={<Search className="h-4 w-4" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          onClear={() => setSearchText("")}
          className="max-w-xs"
        />
      </div>
      <Table
        columns={columns}
        data={filteredPosts ?? []}
        rowKey={(record) => record.slug}
        loading={isLoading || isDeleting}
        emptyText="No posts found"
      />
    </div>
  );
}
