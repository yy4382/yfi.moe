import { postCollection } from "@/lib/content-layer/collections";
import getRssResponse from "@/lib/rss";
import { markdownToHtml } from "@repo/markdown/parse";

export const dynamic = "error";

export async function GET() {
  const entries = await postCollection.getCollectionWithBody();
  const items = [];
  for (let i = 0; i < 8; i++) {
    const entry = entries[i];
    if (!entry) {
      continue;
    }
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
