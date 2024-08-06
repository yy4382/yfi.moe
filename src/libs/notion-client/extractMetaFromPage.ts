import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
export type PageMeta = {
  title: string | undefined;
  id: string;
  createdAt: string;
  updatedAt: string;
};
export default function (page: PageObjectResponse): PageMeta {
  const title = findTitle(page.properties);
  return {
    title,
    id: page.id,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

const findTitle = (titleProp: PageObjectResponse["properties"]) => {
  return Object.entries(titleProp)
    .map(([_, value]) => {
      if (value.type === "title") {
        return value.title[0].plain_text;
      }
    })
    .find((value) => value !== undefined);
};
