import { Client } from "@notionhq/client";
import type {
  QueryDatabaseParameters,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import extractMetaFromPage, { type PageMeta } from "./extractMetaFromPage";
import { InsufficientDataError } from "./errors";

type QueryDatabaseFilter = QueryDatabaseParameters["filter"];

/**
 * Retrieves entries from a Notion database.
 *
 * @param {string} databaseId - The ID of the Notion database.
 * @param options - The options for retrieving entries.
 * @throws {InsufficientDataError} when the retrieved entry does not contain enough data.
 * @returns {Promise<Page>} A promise that resolves to an array of PageMeta objects representing the retrieved entries.
 */
export async function getEntries(
  databaseId: string,
  options: {
    apiKey: string;
    filter: QueryDatabaseFilter;
    /**
     *
     * @default { skip: 0, limit: 10 }
     */
    pagination?: { skip: number; limit: number };
  },
): Promise<PageMeta[]> {
  const notion = new Client({ auth: options.apiKey });
  let results: QueryDatabaseResponse["results"] = [];

  const { skip, limit } = options.pagination || { skip: 0, limit: 10 };
  if (skip + limit < 100) {
    const resp = await queryDatabase(databaseId, notion, options.filter, limit);
    results = resp.results.slice(skip, skip + limit);
  } else {
    let cursor: string | undefined = undefined;
    for (let i = 0; i < skip + limit; i += 100) {
      const resp = await queryDatabase(
        databaseId,
        notion,
        options.filter,
        100,
        cursor,
      );
      results = results.concat(resp.results);
      if (!resp.has_more)
        throw new InsufficientDataError(results.length, { skip, limit });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      cursor = resp.next_cursor!;
    }
    results = results.slice(skip, skip + limit);
  }

  return (
    await Promise.all(
      results.map(async (page) => {
        if (!(page.object === "page" && "created_time" in page))
          return undefined;
        if (page.in_trash || page.archived) return undefined;

        return extractMetaFromPage(page);
      }),
    )
  ).filter((page) => page !== undefined);
}

async function queryDatabase(
  databaseId: string,
  client: Client,
  filter?: QueryDatabaseFilter,
  page_size = 8,
  start_cursor?: string,
) {
  try {
    console.info(
      `Querying Database ${databaseId} with filter: ${JSON.stringify(filter)}`,
    );
    return await client.databases.query({
      database_id: databaseId,
      filter,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      page_size,
      start_cursor,
    });
  } catch (error) {
    if (error instanceof Error)
      console.error("Error when querying database: ", error.message);
    else console.error("Error when querying database: ", error);
    throw new Error("Error when querying Notion database");
  }
}
