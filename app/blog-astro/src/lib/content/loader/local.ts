import type { LoaderContext } from "astro/loaders";
import fs from "fs/promises";
import path from "path";
import { yfiLoader, type ContentFetcher } from "./shared-loader";

export class LocalFetcher implements ContentFetcher {
  name = "local-loader";
  private dirname: string;
  constructor(dirname: string) {
    this.dirname = dirname;
  }
  static fetcherBuilder(dirname: string) {
    return new LocalFetcher(dirname);
  }

  async fetch(
    _ctx: LoaderContext,
  ): Promise<{ file: string; rawContent: string }[]> {
    const files = await fs.readdir(this.dirname);
    return await Promise.all(
      files.map(async (file) => ({
        file,
        rawContent: await fs.readFile(path.join(this.dirname, file), "utf-8"),
      })),
    );
  }
  async shouldRefetchOnWatchChange(changedPath: string) {
    return isAncestor(this.dirname, changedPath);
  }
  async setupFileWatch(ctx: LoaderContext) {
    if (ctx.watcher) {
      ctx.watcher.add(this.dirname);
      ctx.logger.info(`Added watcher for ${this.dirname}`);
    }
  }
}

/**
 * 判断 relPath (相对于 cwd 的路径) 是否是 absPath 的祖先目录
 * @param {string} relPath - 相对路径（相对于 process.cwd()）
 * @param {string} absPath - 绝对路径
 */
function isAncestor(relPath: string, absPath: string) {
  // 把 relPath 转换成绝对路径
  const ancestor = path.resolve(process.cwd(), relPath);
  const relative = path.relative(ancestor, absPath);

  // relative 不以 `..` 开头 且 不是绝对路径 => 说明 absPath 在 ancestor 里面
  return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

export function parseLocalUrl(url: string) {
  if (!url.startsWith("file://")) {
    throw new Error(`Invalid local URL: ${url}`);
  }
  return url.slice(7);
}

export const localLoader = yfiLoader(LocalFetcher.fetcherBuilder);
