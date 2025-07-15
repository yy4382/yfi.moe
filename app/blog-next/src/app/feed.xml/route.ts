import { getPostCollection } from "@/lib/content-layer/collections";
import getRssResponse from "@/lib/rss";
import { markdownToHtml } from "@repo/markdown/parse";

export async function GET() {
  const entries = (
    await getPostCollection({ includeDraft: false })
  ).toReversed();
  const items = [];
  for (let i = 0; i < 8; i++) {
    const entry = entries[i];
    items.push({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description,
      link: `/post/${entry.id}`,
      content: await markdownToHtml(entry.body),
    });
  }
  return getRssResponse({
    title: "Yunfi Blog",
    description: "记录折腾，分享经验",
    site: "https://yfi.moe",
    stylesheet: "/rss-style.xsl",
    items,
  });
}
