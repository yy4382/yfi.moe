import type { ImageMeta } from "@repo/markdown/plugins/rehype-image-metadata";
import { ArticlePreset } from "@repo/markdown/preset";
import {
  markdownToReact,
  type MarkdownReactComponents,
} from "@repo/markdown/react-server";
import { CopyButton } from "@/components/markdown/copy-button";
import { GhCard } from "@/components/markdown/gh-card";

const articleMarkdownComponents = {
  "copy-button": CopyButton,
  "github-repo": GhCard,
} satisfies MarkdownReactComponents;

export function renderArticleMarkdownReact({
  content,
  imageMeta,
}: {
  content: string;
  imageMeta: ImageMeta[];
}) {
  return markdownToReact(content, {
    preset: ArticlePreset,
    components: articleMarkdownComponents,
    fileData: {
      imageMeta,
    },
  });
}
