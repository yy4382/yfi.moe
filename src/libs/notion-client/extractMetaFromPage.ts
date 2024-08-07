import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
export type PageMeta = {
  title: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  short: boolean;
};
export default function (page: PageObjectResponse): PageMeta {
  const title = findTitle(page.properties);
  return {
    title,
    id: page.id.replace(/-/g, ""),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    short:
      page.properties["Short"]?.type === "checkbox"
        ? page.properties["Short"].checkbox
        : false,
  };
}

const findTitle = (titleProp: PageObjectResponse["properties"]) => {
  return (
    Object.entries(titleProp)
      .map(([_, value]) => {
        if (value.type === "title") {
          return value.title[0].plain_text;
        }
      })
      .find((value) => value !== undefined) ?? ""
  );
};
