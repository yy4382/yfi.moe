import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
export type PageMeta = {
  title: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  short: boolean;
  tags: string[];
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
    tags:
      page.properties["Tags"]?.type === "multi_select"
        ? page.properties["Tags"].multi_select.map((tag) => tag.name)
        : [],
  };
}

const findTitle = (titleProp: PageObjectResponse["properties"]) => {
  return (
    Object.entries(titleProp)
      .map(([_, value]) => {
        if (value.type === "title") {
          try {
            return value.title[0].plain_text;
          } catch {
            return "";
          }
        }
      })
      .find((value) => value !== undefined) ?? ""
  );
};
