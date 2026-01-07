import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { MarkdownEditor } from "../components/editor/markdown-editor";
import { Button, Input } from "../components/ui";
import { useCreatePost } from "../hooks/use-posts";

const DEFAULT_TEMPLATE = `---
title: ""
slug: ""
description: ""
date: ${new Date().toISOString().split("T")[0]}
tags: []
published: false
copyright: true
---

`;

export function PostCreatePage() {
  const navigate = useNavigate();
  const { mutate: createPost, isPending: isCreating } = useCreatePost();

  const [slug, setSlug] = useState("");
  const [raw, setRaw] = useState(DEFAULT_TEMPLATE);

  const handleCreate = () => {
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    createPost(
      { slug: slug.trim(), raw },
      {
        onSuccess: () => {
          toast.success("Post created");
          navigate(`/posts/${slug.trim()}`);
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
        <h1 className="text-lg font-semibold text-neutral-900">New Post</h1>
        <div className="flex-1" />
        <div className="flex items-center gap-0">
          <Input
            placeholder="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-48 rounded-r-none border-r-0"
          />
          <Button
            variant="primary"
            icon={<Save className="h-4 w-4" />}
            onClick={handleCreate}
            loading={isCreating}
            className="rounded-l-none"
          >
            Create
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <MarkdownEditor value={raw} onChange={setRaw} />
      </div>
    </div>
  );
}
