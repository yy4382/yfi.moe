import type { components } from "@octokit/openapi-types";

type GetRepoContentDir = components["schemas"]["content-directory"];
type GetRepoContentFile = components["schemas"]["content-file"];
// type GetRef = components["schemas"]["git-ref"];

export type Options = {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  pat: string;
};

const createFetcher = (pat: string) => {
  return async (...args: Parameters<typeof fetch>) => {
    const perfStart = performance.now();
    const response = await fetch(args[0], {
      ...args[1],
      headers: {
        ...args[1]?.headers,
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const json = await response.json();
    const perfEnd = performance.now();
    if (process.env.NODE_ENV === "development" && perfEnd - perfStart > 50) {
      console.debug(`${args[0]} took ${perfEnd - perfStart}ms`);
    }
    return json;
  };
};

export async function fetchRepoDir(
  options: Options,
): Promise<GetRepoContentDir> {
  const { owner, repo, path, ref, pat } = options;
  const url = new URL(
    `repos/${owner}/${repo}/contents/${path}`,
    "https://api.github.com",
  );
  if (ref) url.searchParams.set("ref", ref);
  const fetcher = createFetcher(pat);
  const data = await fetcher(url.toString(), {
    cache: "force-cache",
    next: {
      tags: ["github-content-getter"],
    },
  });
  if (!Array.isArray(data)) {
    throw new Error("Not a directory");
  }
  return data.filter((item) => item.type === "file");
}

export async function fetchFileContent(
  options: Options,
): Promise<GetRepoContentFile> {
  const { owner, repo, path, ref, pat } = options;
  const url = new URL(
    `repos/${owner}/${repo}/contents/${path}`,
    "https://api.github.com",
  );
  if (ref) url.searchParams.set("ref", ref);
  const fetcher = createFetcher(pat);
  const data = (await fetcher(url.toString(), {
    cache: "force-cache",
    next: {
      tags: ["github-content-getter"],
    },
  })) as GetRepoContentFile;
  if (!("content" in data)) {
    throw new Error(`The file at path ${path} does not contain content`);
  }
  return data;
}
