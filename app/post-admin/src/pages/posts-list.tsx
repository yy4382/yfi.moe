import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Table, Button, Tag, Space, Input, Popconfirm, App } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import { usePosts, useDeletePost } from "../hooks/use-posts";
import type { PostListItem } from "../types/post";

export function PostsListPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState("");

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
        message.success("Post deleted");
      },
      onError: (error) => {
        message.error(error.message);
      },
    });
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: PostListItem) => (
        <a onClick={() => navigate(`/posts/${record.slug}`)}>{title}</a>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "published",
      key: "published",
      width: 100,
      render: (published: boolean) => (
        <Tag color={published ? "green" : "orange"}>
          {published ? "Published" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags: string[]) => (
        <Space size={[0, 4]} wrap>
          {tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {tags.length > 3 && <Tag>+{tags.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: PostListItem) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/posts/${record.slug}`)}
          />
          <Popconfirm
            title="Delete post?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.slug)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/posts/new")}
        >
          New Post
        </Button>
      </div>
      <div className="mb-4">
        <Input
          placeholder="Search by title or tag..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredPosts}
        rowKey="slug"
        loading={isLoading || isDeleting}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
