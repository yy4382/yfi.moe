import yaml from "js-yaml";
import type { PostFrontmatter } from "../types.js";

const FRONTMATTER_REGEX = /^---\n([\s\S]+?)\n---\n?/;

export function parseFrontmatter(raw: string): {
  frontmatter: PostFrontmatter;
  content: string;
} {
  const match = FRONTMATTER_REGEX.exec(raw);
  if (!match) {
    throw new Error("Invalid frontmatter: no YAML block found");
  }

  const yamlStr = match[1]!;
  const content = raw.slice(match[0].length);
  const frontmatter = yaml.load(yamlStr) as PostFrontmatter;

  return { frontmatter, content };
}

export function serializeFrontmatter(
  frontmatter: PostFrontmatter,
  content: string,
): string {
  const yamlStr = yaml.dump(frontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });
  return `---\n${yamlStr}---\n${content}`;
}
