import { Client as NotionClient } from "@notionhq/client";
import type { ClientOptions } from "@notionhq/client/build/src/Client";
import { toHtml } from "hast-util-to-html";
import { blockToHast, Client as Notion2HastClient } from "notion2hast";
import { h } from "hastscript";

class Client extends Notion2HastClient {
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
  blockId: string,
  options: { apiKey: string },
) {
  console.log(`Fetching page(block) ${blockId} content from Notion API`);
  const client = new Client({ auth: options.apiKey });
  const tree = await blockToHast(client, {
    block_id: blockId,
    blocktoHastOpts: { defaultClassName: true },
    richTexttoHastOpts: { defaultClassName: true },
  });

  return toHtml(h(null, tree));
}
