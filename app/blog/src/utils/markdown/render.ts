import { unified, type PluggableList } from "unified";
import remarkParse from "remark-parse";
import remarkGithubAlerts from "remark-github-alerts";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeImageOptimization, {
  defineOptions as defineOptimizeOptions,
} from "rehype-image-optim";
import rehypeExtendedLinks from "rehype-extended-links";
import { h } from "hastscript";
import type { Element, Node } from "hast";
import { linkIcons } from "../../configs/markdown";
import rehypeShiki from "@shikijs/rehype";
import { parseFrontmatter, rehypeHeadingIds } from "@astrojs/markdown-remark";
import type { LoaderContext } from "astro/loaders";
import remarkReadingTime from "@utils/markdown/plugins/remarkReadingTime.mjs";
import { rehypeCodeblockCopy } from "./plugins/rehype-codeblock-copy";
import { rehypeHast } from "./plugins/rehype-hast";

export const remarkPlugins: PluggableList = [remarkGithubAlerts];
export const rehypePlugins: PluggableList = [];

export const hastProcessor = unified()
  .use(remarkParse)
  .use(remarkGithubAlerts)
  .use(remarkReadingTime)
  .use(remarkRehype, {
    allowDangerousHtml: true,
  })
  .use(rehypeRaw)
  .use(rehypeRemoveComments)

  .use(
    rehypeImageOptimization,
    defineOptimizeOptions({
      provider: "cloudflare",
      originValidation: (url: string) => {
        return new URL(url).hostname === "i.yfi.moe";
      },
      optimizeSrcOptions: { options: "f=auto,w=640,fit=scale-down" },
      srcsetOptionsList: [
        [{ options: "f=auto,w=320,fit=scale-down" }, "320w"],
        [{ options: "f=auto,w=640,fit=scale-down" }, "640w"],
        [{ options: "f=auto,w=1280,fit=scale-down" }, "1280w"],
      ],
      sizesOptionsList: ["(max-width: 640px) 320px", "640px"],
      style: "max-width: 100%; width:100%; height: auto;",
    }),
  )
  .use(rehypeExtendedLinks, {
    preContent(node: Element): Element | undefined {
      if (nodeHas(node, "img")) return undefined;
      const url = node.properties.href?.toString();
      if (!url) return undefined;
      return linkIcons()
        .map(([icon, regex]) => {
          if (regex.test(url))
            return h("span", {
              className: [icon],
            });
        })
        .find((i) => i !== undefined);
    },
    content(node: Element): Element | undefined {
      if (nodeHas(node, "img")) return undefined;
      return h("span", {
        className: ["i-mingcute-external-link-line"],
      });
    },
  })
  .use(rehypeHeadingIds)
  .use(rehypeShiki, {
    theme: "catppuccin-macchiato",
  })
  .use(rehypeCodeblockCopy);

const nodeHas = (node: Element, tagName: string | string[]): boolean => {
  return node.children.some(
    (child) =>
      child.type === "element" &&
      (typeof tagName === "string"
        ? child.tagName === tagName
        : tagName.includes(child.tagName)),
  );
};

export const parseMarkdown = async (
  rawContent: string,
  filename?: string,
  logger?: LoaderContext["logger"],
) => {
  const { frontmatter, content } = parseFrontmatter(rawContent, {
    frontmatter: "empty-with-spaces",
  });

  if (!("slug" in frontmatter && typeof frontmatter.slug === "string")) {
    logger?.error(`File ${filename} has no slug`);
    throw new Error(`File ${filename} has no slug`);
  }

  const hastVfile = await hastProcessor()
    .use(rehypeHast, {
      removePosition: true,
    })
    .process(structuredClone(content));

  const hastString = String(hastVfile);

  return {
    id: frontmatter.slug,
    body: content.trim(),
    data: {
      ...frontmatter,
      hastString,
      headings: hastVfile.data.astro?.headings,
      readingTime: hastVfile.data.astro?.frontmatter?.readingTime,
    },
  };
};
