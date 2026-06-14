import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { z } from "zod";
import { ContentPageRsc } from "@/components/article/content-page-rsc";
import { getImageMeta, getPage } from "@/lib/content/source";
import { toContentSummary } from "@/lib/content/summary";
import { getMarkdownHeadingList } from "@/lib/markdown/markdown.server";

export const getContentPageRoute = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    const page = await getPage(slug);
    if (!page) {
      return undefined;
    }

    const [imageMeta, headings] = await Promise.all([
      getImageMeta(),
      Promise.resolve(getMarkdownHeadingList(page.body)),
    ]);
    const pageSummary = toContentSummary(page);

    return {
      page: pageSummary,
      article: await renderServerComponent(
        <ContentPageRsc
          page={pageSummary}
          content={page.body}
          headings={headings}
          imageMeta={imageMeta}
        />,
      ),
    };
  });
