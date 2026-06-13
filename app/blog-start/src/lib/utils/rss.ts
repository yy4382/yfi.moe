type RssItem = {
  title: string;
  pubDate: Date | string;
  description?: string;
  link: string;
  content: string;
};

export function renderRss({
  title,
  description,
  site,
  stylesheet,
  items,
}: {
  title: string;
  description: string;
  site: string;
  stylesheet: string;
  items: RssItem[];
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="${stylesheet}" type="text/xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <link>${site}</link>
    <atom:link href="${new URL("/feed.xml", site)}" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${new URL(item.link, site)}</link>
      <guid>${new URL(item.link, site)}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      ${item.description ? `<description>${escapeXml(item.description)}</description>` : ""}
      <content:encoded><![CDATA[${item.content}]]></content:encoded>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
