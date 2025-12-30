import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Spin, App, Button } from "antd";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { MarkdownEditor } from "../components/editor/markdown-editor";
import { usePost, useUpdatePost } from "../hooks/use-posts";

function PostEditor({
  initialRaw,
  slug,
}: {
  initialRaw: string;
  slug: string;
}) {
  const navigate = useNavigate();
  const { mutate: updatePost, isPending: isSaving } = useUpdatePost();
  const { message } = App.useApp();

  const [raw, setRaw] = useState(initialRaw);

  const handleSave = () => {
    updatePost(
      { slug, raw },
      {
        onSuccess: () => {
          message.success("Post saved");
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
        <h1 className="flex-1 truncate text-xl font-bold">{slug}</h1>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isSaving}
        >
          Save
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <MarkdownEditor value={raw} onChange={setRaw} />
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

  return <PostEditor key={slug} initialRaw={post.raw} slug={slug!} />;
}
