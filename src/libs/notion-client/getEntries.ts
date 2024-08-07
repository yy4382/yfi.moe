import { Client } from "@notionhq/client";
import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import extractMetaFromPage, { type PageMeta } from "./extractMetaFromPage";

type QueryDatabaseFilter = QueryDatabaseParameters["filter"];

export async function getEntries(
  databaseId: string,
  options: { apiKey: string; filter: QueryDatabaseFilter },
): Promise<PageMeta[]> {
  const notion = new Client({ auth: options.apiKey });

  const response = await queryDatabase(databaseId, notion, options.filter);

  return (
    await Promise.all(
      response.results.map(async (page) => {
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
      page_size: 8,
    });
  } catch (error) {
    if (error instanceof Error)
      console.error("Error when querying database: ", error.message);
    else console.error("Error when querying database: ", error);
    throw new Error("Error when querying Notion database");
  }
}
