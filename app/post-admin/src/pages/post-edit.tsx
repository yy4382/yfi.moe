import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { MarkdownEditor } from "../components/editor/markdown-editor";
import { Button, Spinner } from "../components/ui";
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

  const [raw, setRaw] = useState(initialRaw);

  const handleSave = () => {
    updatePost(
      { slug, raw },
      {
        onSuccess: () => {
          toast.success("Post saved");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-4">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/")}
        />
        <h1 className="flex-1 truncate text-lg font-semibold text-neutral-900">
          {slug}
        </h1>
        <Button
          variant="primary"
          icon={<Save className="h-4 w-4" />}
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
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm text-red-500">
          {error?.message || "Post not found"}
        </p>
        <Button onClick={() => navigate("/")}>Back to posts</Button>
      </div>
    );
  }

  return <PostEditor key={slug} initialRaw={post.raw} slug={slug!} />;
}
