import { markdownToHtmlAsync } from "@repo/markdown/parse";
import type { ImageMeta } from "@repo/markdown/plugins/rehype-image-metadata";
import type { Options as ReplaceCustomElementsOptions } from "@repo/markdown/plugins/rehype-replace-item";
import rehypeReplaceCustomElements from "@repo/markdown/plugins/rehype-replace-item";
import { ArticlePreset } from "@repo/markdown/preset";

type RenderMarkdownArticleInput = {
  content: string;
  imageMeta: ImageMeta[];
};

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function createArticleHtmlPreset() {
  const replaceCustomElementsPlugin: NonNullable<
    typeof ArticlePreset.plugins
  >[number] = [
    rehypeReplaceCustomElements,
    {
      map: {
        "copy-button": '<div data-react-component="CopyButton"></div>',
        "github-repo": (_, props) => {
          const componentProps = {
            user: String(props.user ?? ""),
            repo: String(props.repo ?? ""),
          };
          return `<div data-react-component="GhCard" data-props="${escapeHtmlAttribute(JSON.stringify(componentProps))}"></div>`;
        },
      } satisfies ReplaceCustomElementsOptions["map"],
    },
  ];

  return {
    plugins: [...(ArticlePreset.plugins ?? []), replaceCustomElementsPlugin],
    settings: ArticlePreset.settings,
  } satisfies typeof ArticlePreset;
}

export async function renderMarkdownArticleHtml({
  content,
  imageMeta,
}: RenderMarkdownArticleInput) {
  const html = await markdownToHtmlAsync(content, {
    preset: createArticleHtmlPreset(),
    fileData: {
      imageMeta,
    },
  });

  return { html };
}
