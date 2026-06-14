import { markdownToHeadings, markdownToHtml } from "@repo/markdown/parse";
import { ArticlePresetFast, ArticleRSSPreset } from "@repo/markdown/preset";
import { getDesc } from "@/lib/content/get-description";

type PostDescriptionInput = {
  body: string;
  description?: string;
};

export function renderPostDescriptionHtmlList(posts: PostDescriptionInput[]) {
  return posts.map(
    (post) =>
      post.description ||
      markdownToHtml(getDesc(post.body), { preset: ArticlePresetFast }),
  );
}

export function getMarkdownHeadingList(content: string) {
  return markdownToHeadings(content);
}

export function renderRssContentHtmlList(bodies: string[]) {
  return bodies.map((body) =>
    markdownToHtml(body, { preset: ArticleRSSPreset }),
  );
}
