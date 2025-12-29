import { markdown } from "@codemirror/lang-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { useState, useMemo } from "react";
import { markdownToHtml } from "@repo/markdown/parse";
import { ArticlePresetFast } from "@repo/markdown/preset";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const htmlContent = useMemo(() => {
    try {
      return markdownToHtml(value, {
        preset: ArticlePresetFast,
        stringifyAllowDangerous: true,
      });
    } catch {
      return "<p>Error rendering markdown</p>";
    }
  }, [value]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200">
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "edit"
              ? "border-b-2 border-blue-500 bg-white text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("edit")}
        >
          Edit
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "preview"
              ? "border-b-2 border-blue-500 bg-white text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {activeTab === "edit" ? (
          <CodeMirror
            value={value}
            onChange={onChange}
            extensions={[markdown()]}
            className="h-full"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
            }}
          />
        ) : (
          <div
            className="prose max-w-none p-4 prose-slate"
            // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </div>
  );
}
