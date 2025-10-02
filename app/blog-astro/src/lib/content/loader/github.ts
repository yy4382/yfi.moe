import type { components } from "@octokit/openapi-types";
import type { LoaderContext } from "astro/loaders";
import { ofetch } from "ofetch";
import { yfiLoader, type ContentFetcher } from "./shared-loader";

type GetRepoContentDir = components["schemas"]["content-directory"];
type GetRepoContentFile = components["schemas"]["content-file"];
type GetRef = components["schemas"]["git-ref"];

type GithubOptions = {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  pat: string;
};

class GithubFetcher implements ContentFetcher {
  name = "github-loader";
  private options: GithubOptions;
  private ofetcher: typeof ofetch;
  constructor(options: GithubOptions) {
    this.options = options;
    this.ofetcher = ofetch.create({
      headers: {
        Authorization: `Bearer ${options.pat}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      retry: 3,
      retryDelay: 500,
      timeout: 5000,
    });
  }
  static fetcherBuilder(options: GithubOptions) {
    return new GithubFetcher(options);
  }

  async checkHasChanged(
    ctx: LoaderContext,
  ): Promise<{ fresh: boolean; updateFailCb: () => void }> {
    // check if last sha is the same as current sha
    const curSha = await this.fetchRefSha();
    const lastSha = ctx.meta.get("lastSha");
    if (curSha !== lastSha) {
      ctx.meta.set("lastSha", curSha);
      ctx.logger.info(
        `Will fetch content with sha ${curSha}, last sha is ${lastSha}`,
      );
      return {
        fresh: false,
        updateFailCb: () => {
          ctx.logger.info(
            `Update failed, will reset last sha to ${lastSha ?? "<not exist>"}`,
          );
          if (lastSha) {
            ctx.meta.set("lastSha", lastSha);
          } else {
            ctx.meta.delete("lastSha");
          }
        },
      };
    } else {
      ctx.logger.info("No new commits, skipping sync");
      return { fresh: true, updateFailCb: () => {} };
    }
  }

  async fetch(
    _ctx: LoaderContext,
  ): Promise<{ file: string; rawContent: string }[]> {
    const dirFiles = (await this.fetchDir()).filter(
      (file) => file.type === "file",
    );
    const files = await Promise.all(
      dirFiles.map(async (file) => {
        const fileResp = await this.fetchFileContent(file.path);
        return { file: file.path, rawContent: this.getContent(fileResp) };
      }),
    );
    return files;
  }

  private async fetchRefSha() {
    const { owner, repo, ref } = this.options;
    const url = new URL(
      `repos/${owner}/${repo}/git/ref/${ref}`,
      "https://api.github.com",
    );
    const data: GetRef = await this.ofetcher(url.toString());
    return data.object.sha;
  }

  private async fetchDir(): Promise<GetRepoContentDir> {
    const { owner, repo, path, ref } = this.options;
    const url = new URL(
      `repos/${owner}/${repo}/contents/${path}`,
      "https://api.github.com",
    );
    if (ref) url.searchParams.set("ref", ref);
    const data = await this.ofetcher(url.toString());
    if (!Array.isArray(data)) {
      throw new Error("Not a directory");
    }
    return data;
  }

  private async fetchFileContent(path: string): Promise<GetRepoContentFile> {
    const { owner, repo, ref } = this.options;
    const url = new URL(
      `repos/${owner}/${repo}/contents/${path}`,
      "https://api.github.com",
    );
    if (ref) url.searchParams.set("ref", ref);
    const data = await this.ofetcher(url.toString());
    if (!("content" in data)) {
      throw new Error(`The file at path ${path} does not contain content`);
    }
    return data;
  }

  private getContent(file: GetRepoContentFile) {
    if (file.encoding !== "base64") {
      throw new Error(
        `File ${file.name} is not base64 encoded, it is ${file.encoding}`,
      );
    }
    const rawContent = Buffer.from(file.content, "base64").toString("utf-8");
    return rawContent;
  }
}

const githubUrlRegex =
  /^https:\/\/github\.com\/(?<owner>.+)\/(?<repo>.+)\/tree\/(?<ref>.+)\/(?<path>.*)$/;

/**
 * Parse the GitHub URL to get the owner, repo, path, and ref.
 *
 * @example
 * ```ts
 * parseContentUrl("https://github.com/yy4382/blog/tree/main/content/post");
 * // { owner: "yy4382", repo: "blog", path: "content/post", ref: "main" }
 * ```
 *
 * @param url - The GitHub URL to parse.
 * @returns The owner, repo, path, and ref.
 */
export function parseGithubUrl(url: string): Omit<GithubOptions, "pat"> {
  const match = githubUrlRegex.exec(url);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }
  if (!match.groups) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }
  const rawRef = match.groups.ref;
  const ref = rawRef.includes("/") ? rawRef : `heads/${rawRef}`;
  return {
    owner: match.groups.owner,
    repo: match.groups.repo,
    path: match.groups.path,
    ref,
  };
}

export const githubLoader = yfiLoader(GithubFetcher.fetcherBuilder);
