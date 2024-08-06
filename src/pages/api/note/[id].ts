import type { APIRoute } from "astro";
import { getPageContent } from "@libs/notion-client";

export const prerender = false;

export const GET: APIRoute = async ({ params, request: _ }) => {
  const pageId = params.id ?? "";
  const apiKey = import.meta.env.NOTION_API_KEY;
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
};
