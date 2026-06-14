"use client";

import { createElement, useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CopyButton } from "@/components/markdown/copy-button";
import { GhCard } from "@/components/markdown/gh-card";

export function MarkdownArticle({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const roots: Root[] = [];
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container
      .querySelectorAll("[data-react-component='CopyButton']")
      .forEach((button) => {
        const root = createRoot(button);
        root.render(createElement(CopyButton));
        roots.push(root);
      });

    container
      .querySelectorAll("[data-react-component='GhCard']")
      .forEach((card) => {
        const props = JSON.parse(card.getAttribute("data-props") ?? "{}") as {
          user?: string;
          repo?: string;
        };
        const root = createRoot(card);
        root.render(
          createElement(GhCard, {
            user: String(props.user ?? ""),
            repo: String(props.repo ?? ""),
          }),
        );
        roots.push(root);
      });

    return () => {
      roots.forEach((root) => root.unmount());
    };
  }, [html]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
