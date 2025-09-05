import type { Loader, LoaderContext, DataStore } from "astro/loaders";
import type { components } from "@octokit/openapi-types";
import { ofetch } from "ofetch";
import yaml from "js-yaml";

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

  const fetcher = ofetch.create({
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    retry: 3,
    retryDelay: 500,
    timeout: 5000,
  });

  return {
    name: "github-loader",
    load: async (ctx) => {
      // check if last sha is the same as current sha
      const curSha = await fetchRefSha(options, fetcher);
      const lastSha = ctx.meta.get("lastSha");
      if (curSha !== lastSha) {
        await syncContent();
        ctx.meta.set("lastSha", curSha);
        ctx.logger.info(
          `Synced content with sha ${curSha}, now has ${ctx.store.keys().length} files`,
        );
      } else {
        ctx.logger.info("No new commits, skipping sync");
      }

      async function syncContent() {
        const untouched = new Set(ctx.store.keys());

        const dirFiles = (await fetchDir(options, fetcher)).filter(
          (file) => file.type === "file",
        );
        const files = await Promise.all(
          dirFiles.map(async (file) => {
            const fileResp = await fetchFileContent(
              { ...options, path: file.path },
              fetcher,
            );
            return processFile(fileResp, ctx);
          }),
        );
        files.forEach((file) => {
          untouched.delete(file.id);
          ctx.store.set(file);
          ctx.logger.info(`Loaded file ${file.id}`);
        });

        // removed files that no longer in repo
        untouched.forEach((id) => ctx.store.delete(id));
      }
    },
  };
}

async function fetchRefSha(
  options: Omit<Options, "pat">,
  fetcher: typeof ofetch,
) {
  const { owner, repo, ref } = options;
  const url = new URL(
    `repos/${owner}/${repo}/git/ref/${ref}`,
    "https://api.github.com",
  );
  const data: GetRef = await fetcher(url.toString());
  return data.object.sha;
}

async function fetchDir(
  options: Omit<Options, "pat">,
  fetcher: typeof ofetch,
): Promise<GetRepoContentDir> {
  const { owner, repo, path, ref } = options;
  const url = new URL(
    `repos/${owner}/${repo}/contents/${path}`,
    "https://api.github.com",
  );
  if (ref) url.searchParams.set("ref", ref);
  const data = await fetcher(url.toString());
  if (!Array.isArray(data)) {
    throw new Error("Not a directory");
  }
  return data;
}

async function fetchFileContent(
  options: Omit<Options, "pat">,
  fetcher: typeof ofetch,
): Promise<GetRepoContentFile> {
  const { owner, repo, path, ref } = options;
  const url = new URL(
    `repos/${owner}/${repo}/contents/${path}`,
    "https://api.github.com",
  );
  if (ref) url.searchParams.set("ref", ref);
  const data = await fetcher(url.toString());
  if (!("content" in data)) {
    throw new Error(`The file at path ${path} does not contain content`);
  }
  return data;
}

async function processFile(
  file: GetRepoContentFile,
  ctx: LoaderContext,
): Promise<Parameters<DataStore["set"]>[0]> {
  if (file.encoding !== "base64") {
    throw new Error(
      `File ${file.name} is not base64 encoded, it is ${file.encoding}`,
    );
  }
  const rawContent = Buffer.from(file.content, "base64").toString("utf-8");

  const { data, content } = parseMarkdownFrontmatter(rawContent);

  if (!data.slug || typeof data.slug !== "string") {
    throw new Error(`File ${file.name} does not have a slug`);
  }

  const parsedFm = await ctx.parseData({ id: data.slug, data });

  return {
    id: data.slug,
    body: content,
    data: parsedFm,
    digest: ctx.generateDigest(rawContent),
  };
}

function parseMarkdownFrontmatter(markdown: string) {
  const match = /^---\n([\s\S]+?)\n---\n?/m.exec(markdown);
  if (!match) return { data: {}, content: markdown };

  const yamlStr = match[1]!;
  const content = markdown.slice(match[0].length);

  const data = yaml.load(yamlStr) as Record<string, unknown>;
  return { data, content };
}
