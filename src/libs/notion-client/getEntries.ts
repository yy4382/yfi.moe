import { Client } from "@notionhq/client";
import type {
  QueryDatabaseParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { renderRichText } from "../notion-to-html";

type QueryDatabaseFilter = QueryDatabaseParameters["filter"];

export async function getPublishedPages(
  databaseId: string,
  options: { apiKey: string; filter: QueryDatabaseFilter },
) {
  const notion = new Client({ auth: options.apiKey });

  const response = await queryDatabase(databaseId, notion, options.filter);

  return (
    await Promise.all(
      response.results.map(async (page) => {
        if (!(page.object === "page" && "created_time" in page))
          return undefined;
        if (page.in_trash || page.archived) return undefined;

        const title = findTitle(page.properties);
        return {
          title,
          id: page.id,
          createdAt: page.created_time,
          updatedAt: page.last_edited_time,
        };
      }),
    )
  ).filter((page) => page !== undefined);
}

const findTitle = (titleProp: PageObjectResponse["properties"]) => {
  return Object.entries(titleProp)
    .map(([_, value]) => {
      if (value.type === "title") {
        return renderRichText(value.title);
      }
    })
    .find((value) => value !== undefined);
};

async function queryDatabase(
  databaseId: string,
  client: Client,
  filter?: QueryDatabaseFilter,
) {
  try {
    console.log(
      `Querying Database ${databaseId} with filter: ${JSON.stringify(filter)}`,
    );
    return await client.databases.query({
      database_id: databaseId,
      filter,
    });
  } catch (error) {
    if (error instanceof Error)
      console.error("Error when querying database: ", error.message);
    else console.error("Error when querying database: ", error);
    throw new Error("Error when querying Notion database");
  }
}
