import type { APIRoute } from "astro";
import { getEntries } from "@libs/notion-client";
import { NOTION_NOTE_DATABASE_ID, NOTION_API_KEY } from "astro:env/server";
export type Page = {
  title: string | undefined;
  id: string;
  createdAt: string;
  updatedAt: string;
};
export const prerender = false;
export const GET: APIRoute = async () => {
  const apiKey = NOTION_API_KEY;
  const databaseId = NOTION_NOTE_DATABASE_ID;

  const pages = await getEntries(databaseId, {
    apiKey,
    filter: {
      property: "Is Published",
      checkbox: {
        equals: true,
      },
    },
  });
  return new Response(JSON.stringify(pages));
};
