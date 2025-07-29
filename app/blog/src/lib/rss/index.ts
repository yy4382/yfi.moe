/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { z } from "zod";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { rssSchema } from "./schema";
import { createCanonicalURL, isValidURL } from "./utils";

export { rssSchema };

export type RSSOptions = {
  /** Title of the RSS Feed */
  title: z.infer<typeof rssOptionsValidator>["title"];
  /** Description of the RSS Feed */
  description: z.infer<typeof rssOptionsValidator>["description"];
  /**
   * Specify the base URL to use for RSS feed links.
   * We recommend using the [endpoint context object](https://docs.astro.build/en/reference/api-reference/#contextsite),
   * which includes the `site` configured in your project's `astro.config.*`
   */
  site: z.infer<typeof rssOptionsValidator>["site"] | URL;
  /** List of RSS feed items to render. */
  items: RSSFeedItem[];
  /** Specify arbitrary metadata on opening <xml> tag */
  xmlns?: z.infer<typeof rssOptionsValidator>["xmlns"];
  /**
   * Specifies a local custom XSL stylesheet. Ex. '/public/custom-feed.xsl'
   */
  stylesheet?: z.infer<typeof rssOptionsValidator>["stylesheet"];
  /** Specify custom data in opening of file */
  customData?: z.infer<typeof rssOptionsValidator>["customData"];
  trailingSlash?: z.infer<typeof rssOptionsValidator>["trailingSlash"];
};

export type RSSFeedItem = {
  /** Link to item */
  link?: z.infer<typeof rssSchema>["link"];
  /** Full content of the item. Should be valid HTML */
  content?: z.infer<typeof rssSchema>["content"];
  /** Title of item */
  title?: z.infer<typeof rssSchema>["title"];
  /** Publication date of item */
  pubDate?: z.infer<typeof rssSchema>["pubDate"];
  /** Item description */
  description?: z.infer<typeof rssSchema>["description"];
  /** Append some other XML-valid data to this item */
  customData?: z.infer<typeof rssSchema>["customData"];
  /** Categories or tags related to the item */
  categories?: z.infer<typeof rssSchema>["categories"];
  /** The item author's email address */
  author?: z.infer<typeof rssSchema>["author"];
  /** A URL of a page for comments related to the item */
  commentsUrl?: z.infer<typeof rssSchema>["commentsUrl"];
  /** The RSS channel that the item came from */
  source?: z.infer<typeof rssSchema>["source"];
  /** A media object that belongs to the item */
  enclosure?: z.infer<typeof rssSchema>["enclosure"];
};

type ValidatedRSSOptions = z.infer<typeof rssOptionsValidator>;

const rssOptionsValidator = z.object({
  title: z.string(),
  description: z.string(),
  site: z.preprocess(
    (url) => (url instanceof URL ? url.href : url),
    z.string().url(),
  ),
  items: z.array(rssSchema),
  xmlns: z.record(z.string(), z.string()).optional(),
  stylesheet: z.union([z.string(), z.boolean()]).optional(),
  customData: z.string().optional(),
  trailingSlash: z.boolean().default(true),
});

export default async function getRssResponse(
  rssOptions: RSSOptions,
): Promise<Response> {
  const rssString = await getRssString(rssOptions);
  return new Response(rssString, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

export async function getRssString(rssOptions: RSSOptions): Promise<string> {
  const validatedRssOptions = await validateRssOptions(rssOptions);
  return generateRSS(validatedRssOptions);
}

async function validateRssOptions(rssOptions: RSSOptions) {
  const parsedResult = await rssOptionsValidator.safeParseAsync(rssOptions);
  if (parsedResult.success) {
    return parsedResult.data;
  }
  const formattedError = new Error(`[RSS] Invalid or missing options`);
  throw formattedError;
}

/** Generate RSS 2.0 feed */
function generateRSS(rssOptions: ValidatedRSSOptions): string {
  const { items, site } = rssOptions;

  const xmlOptions = {
    ignoreAttributes: false,
    // Avoid correcting self-closing tags to standard tags
    // when using `customData`
    // https://github.com/withastro/astro/issues/5794
    suppressEmptyNode: true,
    suppressBooleanAttributes: false,
  };
  const parser = new XMLParser(xmlOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root: any = { "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" } };
  if (typeof rssOptions.stylesheet === "string") {
    const isXSL = /\.xslt?$/i.test(rssOptions.stylesheet);
    root["?xml-stylesheet"] = {
      "@_href": rssOptions.stylesheet,
      ...(isXSL && { "@_type": "text/xsl" }),
    };
  }
  root.rss = { "@_version": "2.0" };
  if (items.find((result) => result.content)) {
    // the namespace to be added to the xmlns:content attribute to enable the <content> RSS feature
    const XMLContentNamespace = "http://purl.org/rss/1.0/modules/content/";
    root.rss["@_xmlns:content"] = XMLContentNamespace;
    // Ensure that the user hasn't tried to manually include the necessary namespace themselves
    if (
      rssOptions.xmlns?.content &&
      rssOptions.xmlns.content === XMLContentNamespace
    ) {
      delete rssOptions.xmlns.content;
    }
  }

  // xmlns
  if (rssOptions.xmlns) {
    for (const [k, v] of Object.entries(rssOptions.xmlns)) {
      root.rss[`@_xmlns:${k}`] = v;
    }
  }

  // title, description, customData
  root.rss.channel = {
    title: rssOptions.title,
    description: rssOptions.description,
    link: createCanonicalURL(site, rssOptions.trailingSlash, undefined),
  };
  if (typeof rssOptions.customData === "string")
    Object.assign(
      root.rss.channel,
      parser.parse(`<channel>${rssOptions.customData}</channel>`).channel,
    );
  // items
  root.rss.channel.item = items.map((result) => {
    const item: Record<string, unknown> = {};

    if (result.title) {
      item.title = result.title;
    }
    if (typeof result.link === "string") {
      // If the item's link is already a valid URL, don't mess with it.
      const itemLink = isValidURL(result.link)
        ? result.link
        : createCanonicalURL(result.link, rssOptions.trailingSlash, site);
      item.link = itemLink;
      item.guid = { "#text": itemLink, "@_isPermaLink": "true" };
    }
    if (result.description) {
      item.description = result.description;
    }
    if (result.pubDate) {
      item.pubDate = result.pubDate.toUTCString();
    }
    // include the full content of the post if the user supplies it
    if (typeof result.content === "string") {
      item["content:encoded"] = result.content;
    }
    if (typeof result.customData === "string") {
      Object.assign(
        item,
        parser.parse(`<item>${result.customData}</item>`).item,
      );
    }
    if (Array.isArray(result.categories)) {
      item.category = result.categories;
    }
    if (typeof result.author === "string") {
      item.author = result.author;
    }
    if (typeof result.commentsUrl === "string") {
      item.comments = isValidURL(result.commentsUrl)
        ? result.commentsUrl
        : createCanonicalURL(
            result.commentsUrl,
            rssOptions.trailingSlash,
            site,
          );
    }
    if (result.source) {
      item.source = parser.parse(
        `<source url="${result.source.url}">${result.source.title}</source>`,
      ).source;
    }
    if (result.enclosure) {
      const enclosureURL = isValidURL(result.enclosure.url)
        ? result.enclosure.url
        : createCanonicalURL(
            result.enclosure.url,
            rssOptions.trailingSlash,
            site,
          );
      item.enclosure = parser.parse(
        `<enclosure url="${enclosureURL}" length="${result.enclosure.length}" type="${result.enclosure.type}"/>`,
      ).enclosure;
    }
    return item;
  });

  return new XMLBuilder(xmlOptions).build(root);
}
