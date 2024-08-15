import { getPageContent } from "@libs/notion-client";
import {
  NOTION_NOTE_DATABASE_ID as databaseId,
  NOTION_API_KEY as apiKey,
} from "astro:env/server";
import type { GetPageResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Options as TruncateOptions } from "hast-util-truncate";

type ResponseData = Awaited<ReturnType<typeof getPageContent>>;

export default async function getNoteContent(
  pageId: string,
  options?: { truncate?: boolean | TruncateOptions },
): Promise<{
  data: ResponseData | null;
  error: string | null;
  code: number;
}> {
  try {
    const data = await getPageContent(pageId, {
      apiKey,
      accessControl,
      truncate: options?.truncate,
    });
    return { data, error: null, code: 200 };
  } catch (err) {
    if (
      err instanceof Error &&
      err.cause &&
      typeof err.cause === "object" &&
      "code" in err.cause
    ) {
      if (err.cause.code === "ACCESS_DENIED") {
        return { data: null, error: "Access Denied", code: 403 };
      }
      if (err.cause.code === "NOT_A_PAGE") {
        return { data: null, error: "Invalid Page ID", code: 400 };
      }
    }
    const error = err instanceof Error ? err.message : "An error occurred";
    return { data: null, error, code: 500 };
  }
}

const accessControl = (resp: GetPageResponse) => {
  const isValid =
    "created_time" in resp &&
    resp.parent.type === "database_id" &&
    resp.parent.database_id.replace(/-/g, "") === databaseId &&
    resp.properties["Is Published"].type === "checkbox" &&
    resp.properties["Is Published"].checkbox === true;

  return isValid;
};
