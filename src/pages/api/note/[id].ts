import type { APIRoute } from "astro";
import { getPageContent } from "@libs/notion-client";

export const prerender = false;

export const GET: APIRoute = async ({ params, request: _ }) => {
  const pageId = params.id ?? "";
  const apiKey = import.meta.env.NOTION_API_KEY;
  try {
    const pageContent = await getPageContent(pageId, {
      apiKey,
      accessControl: (resp) => {
        const isValid =
          "created_time" in resp &&
          resp.parent.type === "database_id" &&
          resp.parent.database_id.replace(/-/g, "") ===
            import.meta.env.NOTION_NOTE_DATABASE_ID &&
          resp.properties["Is Published"].type === "checkbox" &&
          resp.properties["Is Published"].checkbox === true;

        return isValid;
      },
    });
    return new Response(JSON.stringify(pageContent));
  } catch (error) {
    if (
      error instanceof Error &&
      error.cause &&
      typeof error.cause === "object" &&
      "code" in error.cause
    ) {
      if (error.cause.code === "ACCESS_DENIED") {
        return new Response("Access Denied", { status: 403 });
      }
      if (error.cause.code === "NOT_A_PAGE") {
        return new Response("Not a Page", { status: 400 });
      }
    }
    return new Response("Internal Server Error", { status: 500 });
  }
};
