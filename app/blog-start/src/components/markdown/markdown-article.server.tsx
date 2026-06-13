import type { ImageMeta } from "@repo/markdown/plugins/rehype-image-metadata";
import { ArticlePreset } from "@repo/markdown/preset";
import { markdownToReact } from "@repo/markdown/react-server";
import { CopyButton } from "@/components/markdown/copy-button";
import { GhCard } from "@/components/markdown/gh-card";

function GithubRepoComponent(props: Record<string, unknown>) {
  return (
    <GhCard user={String(props.user ?? "")} repo={String(props.repo ?? "")} />
  );
}

export async function MarkdownArticle({
  content,
  imageMeta,
}: {
  content: string;
  imageMeta: ImageMeta[];
}) {
  return (
    <>
      {await markdownToReact(content, {
        preset: ArticlePreset,
        components: {
          "copy-button": CopyButton,
          "github-repo": GithubRepoComponent,
        },
        fileData: {
          imageMeta,
        },
      })}
    </>
  );
}
