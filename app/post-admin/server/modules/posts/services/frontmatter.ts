import yaml from "js-yaml";

interface ParsedFrontmatter {
  slug: string;
  title: string;
  date: string;
  published: boolean;
  tags: string[];
}

const FRONTMATTER_REGEX = /^---\n([\s\S]+?)\n---\n?/;

export function parseFrontmatter(raw: string): {
  frontmatter: ParsedFrontmatter;
} {
  const match = FRONTMATTER_REGEX.exec(raw);
  if (!match) {
    throw new Error("Invalid frontmatter: no YAML block found");
  }

  const yamlStr = match[1]!;
  const data = yaml.load(yamlStr) as Record<string, unknown>;

  return {
    frontmatter: {
      slug: String(data.slug ?? ""),
      title: String(data.title ?? ""),
      date: String(data.date ?? ""),
      published: Boolean(data.published),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    },
  };
}
