import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { App, Button, Input, Space } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import { MarkdownEditor } from "../components/editor/markdown-editor";
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
  const { message } = App.useApp();

  const [slug, setSlug] = useState("");
  const [raw, setRaw] = useState(DEFAULT_TEMPLATE);

  const handleCreate = () => {
    if (!slug.trim()) {
      message.error("Slug is required");
      return;
    }

    createPost(
      { slug: slug.trim(), raw },
      {
        onSuccess: () => {
          message.success("Post created");
          navigate(`/posts/${slug.trim()}`);
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
        <div className="flex-1" />
        <Space.Compact>
          <Input
            placeholder="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleCreate}
            loading={isCreating}
          >
            Create
          </Button>
        </Space.Compact>
      </div>
      <div className="min-h-0 flex-1">
        <MarkdownEditor value={raw} onChange={setRaw} />
      </div>
    </div>
  );
}
