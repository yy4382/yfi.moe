import { ArrowLeftOutlined } from "@ant-design/icons";
import { App, Button } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import { MarkdownEditor } from "../components/editor/markdown-editor";
import { PostForm } from "../components/post/post-form";
import { useCreatePost } from "../hooks/use-posts";
import type { PostFrontmatter } from "../types/post";

export function PostCreatePage() {
  const navigate = useNavigate();
  const { mutate: createPost, isPending: isCreating } = useCreatePost();
  const { message } = App.useApp();

  const [content, setContent] = useState("");

  const handleCreate = (frontmatter: PostFrontmatter) => {
    createPost(
      { frontmatter, content },
      {
        onSuccess: () => {
          message.success("Post created successfully");
          navigate(`/posts/${frontmatter.slug}`);
        },
        onError: (error) => {
          message.error(error.message);
        },
      },
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/")}
          type="text"
        />
        <h1 className="text-xl font-bold">New Post</h1>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr] gap-4">
        <div className="overflow-auto">
          <PostForm onSubmit={handleCreate} isLoading={isCreating} isCreate />
        </div>
        <div className="min-h-0">
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
