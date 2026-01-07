import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useState, useEffect } from "react";
import { markdownToHtmlAsync } from "@repo/markdown/parse";
import { ArticlePreset } from "@repo/markdown/preset";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const content = value.replace(/^---[\s\S]*?---\n*/, "");
    markdownToHtmlAsync(content, {
      preset: ArticlePreset,
      stringifyAllowDangerous: true,
    })
      .then(setHtmlContent)
      .catch(() => setHtmlContent("<p>Error rendering markdown</p>"));
  }, [value]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200">
      {/* Tabs - only visible on small screens */}
      <div className="flex border-b border-neutral-200 bg-neutral-50 xl:hidden">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "border-b-2 border-neutral-900 bg-white text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => setActiveTab("edit")}
        >
          Edit
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "border-b-2 border-neutral-900 bg-white text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
      </div>

      {/* Content - side by side on xl screens */}
      <div className="flex min-h-0 flex-1">
        {/* Editor */}
        <div
          className={`min-h-0 flex-1 overflow-auto ${
            activeTab === "edit" ? "block" : "hidden"
          } xl:block xl:border-r xl:border-neutral-200`}
        >
          <CodeMirror
            value={value}
            onChange={onChange}
            extensions={[markdown(), EditorView.lineWrapping]}
            className="h-full"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
            }}
          />
        </div>

        {/* Preview */}
        <div
          className={`min-h-0 flex-1 overflow-auto ${
            activeTab === "preview" ? "block" : "hidden"
          } xl:block`}
        >
          <div
            className="mx-auto prose p-4 prose-slate"
            // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}
