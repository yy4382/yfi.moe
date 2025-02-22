import type { Loader, LoaderContext, DataStore } from "astro/loaders";
import type { components } from "@octokit/openapi-types";
import {
  createMarkdownProcessor,
  parseFrontmatter,
  type MarkdownProcessor,
} from "@astrojs/markdown-remark";

type GetRepoContentDir = components["schemas"]["content-directory"];
type GetRepoContentFile = components["schemas"]["content-file"];
type GetRef = components["schemas"]["git-ref"];

type Options = {
  owner: string;
  repo: string;
  path: string;
  ref?: string;
  pat: string;
};

export function githubLoader(inputOptions: Options): Loader {
  const { pat, ref: rawRef } = inputOptions;

  const options = {
    ...inputOptions,
    ref: rawRef
      ? rawRef.includes("/")
        ? rawRef
        : `heads/${rawRef}`
      : undefined,
    pat: undefined,
  };

  const fetchWithHeader = (...args: Parameters<typeof fetch>) => {
    try {
      return fetch(args[0], {
        ...args[1],
        headers: {
          ...args[1]?.headers,
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
    } catch (e) {
      throw new Error(
        "Failed to fetch with header in github loader",
        e as Error,
      );
    }
  };

  return {
    name: "github-loader",
    load: async (ctx) => {
      const processor = await createMarkdownProcessor(ctx.config.markdown);

      const syncContent = async () => {
        const untouched = new Set(ctx.store.keys());

        const dirFiles = (await fetchDir(options, fetchWithHeader, ctx)).filter(
          (file) => file.type === "file",
        );
        const files = await Promise.all(
          dirFiles.map(async (file) => {
            const fileResp = await fetchFileContent(
              { ...options, path: file.path },
              fetchWithHeader,
              ctx,
            );
            return processFile(fileResp, ctx, processor);
          }),
        );
        files.forEach((file) => {
          untouched.delete(file.id);
          ctx.store.set(file);
          ctx.logger.info(`Loaded file ${file.id}`);
        });

        // removed files that no longer in repo
        untouched.forEach((id) => ctx.store.delete(id));
      };
      const curSha = await fetchRefSha(options, fetchWithHeader, ctx);
      const lastSha = ctx.meta.get("lastSha");
      if (curSha !== lastSha) {
        await syncContent();
        ctx.meta.set("lastSha", curSha);
      } else {
        ctx.logger.info("No new commits, skipping sync");
      }
    },
  };
}

async function fetchRefSha(
  options: Omit<Options, "pat">,
  fetcher: typeof fetch,
  ctx: LoaderContext,
) {
  const { owner, repo, ref } = options;
  const url = new URL(
    `repos/${owner}/${repo}/git/ref/${ref}`,
    "https://api.github.com",
  );
  const resp = await fetcher(url);
  if (!resp.ok) {
    ctx.logger.error(await resp.text());
    throw new Error("Failed to fetch SHA of ref " + ref);
  }
  const data = (await resp.json()) as GetRef;
  return data.object.sha;
}

async function fetchDir(
  options: Omit<Options, "pat">,
  fetcher: typeof fetch,
  ctx: LoaderContext,
) {
  const { owner, repo, path, ref } = options;
  const url = new URL(
    `repos/${owner}/${repo}/contents/${path}`,
    "https://api.github.com",
  );
  if (ref) url.searchParams.set("ref", ref);
  const resp = await fetcher(url);
  if (!resp.ok) {
    ctx.logger.error(await resp.text());
    throw new Error("Failed to fetch path " + path);
  }
  const data = await resp.json();
  if (!Array.isArray(data)) {
    throw new Error("Not a directory");
  }
  return data as GetRepoContentDir;
}

async function fetchFileContent(
  options: Omit<Options, "pat">,
  fetcher: typeof fetch,
  ctx: LoaderContext,
) {
  const { owner, repo, path, ref } = options;
  const url = new URL(
    `repos/${owner}/${repo}/contents/${path}`,
    "https://api.github.com",
  );
  if (ref) url.searchParams.set("ref", ref);
  const resp = await fetcher(url);
  if (!resp.ok) {
    ctx.logger.error(await resp.text());
    throw new Error("Failed to fetch file " + path);
  }
  const data = await resp.json();
  if (!("content" in data)) {
    throw new Error(`The file at path ${path} does not contain content`);
  }
  return data as GetRepoContentFile;
}

async function processFile(
  file: GetRepoContentFile,
  ctx: Pick<LoaderContext, "generateDigest" | "parseData">,
  processor: MarkdownProcessor,
): Promise<Parameters<DataStore["set"]>[0]> {
  if (file.encoding !== "base64") {
    throw new Error(
      `File ${file.name} is not base64 encoded, it is ${file.encoding}`,
    );
  }
  const rawContent = Buffer.from(file.content, "base64").toString("utf-8");
  const { frontmatter, content } = parseFrontmatter(rawContent, {
    frontmatter: "empty-with-spaces",
  });

  const id = (frontmatter.slug as string) ?? file.name.split(".")[0];

  const parsedFm = await ctx.parseData({
    id,
    data: frontmatter,
  });

  const { code, metadata } = await processor.render(content.trim());

  return {
    id,
    body: content.trim(),
    data: parsedFm,
    digest: ctx.generateDigest(rawContent),
    rendered: {
      html: code,
      metadata,
    },
  };
}
