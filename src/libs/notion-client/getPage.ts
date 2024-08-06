import { Client as NotionClient } from "@notionhq/client";
import type { ClientOptions } from "@notionhq/client/build/src/Client";
import { toHtml } from "hast-util-to-html";
import { blockToHast, Client as Notion2HastClient } from "notion2hast";
import { h } from "hastscript";
import type { GetPageResponse } from "@notionhq/client/build/src/api-endpoints";

class FromNotion extends Notion2HastClient {
  private client: NotionClient;
  constructor(options?: ClientOptions) {
    super();
    this.client = new NotionClient(options);
  }
  listBlockChildren(
    ...args: Parameters<NotionClient["blocks"]["children"]["list"]>
  ): ReturnType<NotionClient["blocks"]["children"]["list"]> {
    return this.client.blocks.children.list(...args);
  }
}

export async function getPageContent(
  pageId: string,
  options: {
    apiKey: string;
    accessControl: (response: GetPageResponse) => boolean;
  },
) {
  // Check if the user has access to the page
  const client = new NotionClient({ auth: options.apiKey });
  console.time(`Fetching page(block) ${pageId} content from Notion API`);
  const response = await client.pages.retrieve({ page_id: pageId });
  if (!options.accessControl(response)) {
    console.error(`Trying to visit ${pageId} but access is denied`);
    console.timeEnd(`Fetching page(block) ${pageId} content from Notion API`);
    return toHtml(h("div", "Access Denied, please contact the owner"));
  }

  const FromNotionClient = new FromNotion({ auth: options.apiKey });
  const tree = await blockToHast(FromNotionClient, {
    block_id: pageId,
    blocktoHastOpts: { defaultClassName: true },
    richTexttoHastOpts: { defaultClassName: true },
  });
  console.timeEnd(`Fetching page(block) ${pageId} content from Notion API`);

  return toHtml(h(null, tree));
}
