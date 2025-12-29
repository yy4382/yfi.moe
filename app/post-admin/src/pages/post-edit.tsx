import { ArrowLeftOutlined } from "@ant-design/icons";
import { Spin, App, Button } from "antd";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { MarkdownEditor } from "../components/editor/markdown-editor";
import { PostForm } from "../components/post/post-form";
import { usePost, useUpdatePost } from "../hooks/use-posts";
import type { PostFrontmatter } from "../types/post";

function PostEditor({
  initialContent,
  initialFrontmatter,
  slug,
  title,
}: {
  initialContent: string;
  initialFrontmatter: PostFrontmatter;
  slug: string;
  title: string;
}) {
  const navigate = useNavigate();
  const { mutate: updatePost, isPending: isSaving } = useUpdatePost();
  const { message } = App.useApp();

  const [content, setContent] = useState(initialContent);

  const handleSave = (frontmatter: PostFrontmatter) => {
    updatePost(
      { slug, frontmatter, content },
      {
        onSuccess: () => {
          message.success("Post saved successfully");
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
        <h1 className="flex-1 truncate text-xl font-bold">{title}</h1>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr] gap-4">
        <div className="overflow-auto">
          <PostForm
            initialValues={initialFrontmatter}
            onSubmit={handleSave}
            isLoading={isSaving}
          />
        </div>
        <div className="min-h-0">
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}

export function PostEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = usePost(slug!);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-500">
          {error?.message || "Post not found"}
        </p>
        <Button onClick={() => navigate("/")}>Back to posts</Button>
      </div>
    );
  }

  // Use key to reset state when slug changes
  return (
    <PostEditor
      key={slug}
      initialContent={post.content}
      initialFrontmatter={post.frontmatter}
      slug={slug!}
      title={post.frontmatter.title}
    />
  );
}
