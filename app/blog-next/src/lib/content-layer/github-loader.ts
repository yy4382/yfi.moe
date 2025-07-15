import z from "zod";
import {
  fetchFileContent,
  fetchRepoDir,
  type Options,
} from "@/lib/github-client";
import yaml from "js-yaml";

export async function getGithubCollection<
  T extends z.ZodType<{ slug: string }>,
>(collectionId: string, schema: T, options: Options) {
  const filePaths = (await fetchRepoDir(options)).filter(
    (f) => f.type === "file",
  );
  const files = await Promise.all(
    filePaths.map(async (filePath) => {
      const file = await fetchFileContent({ ...options, path: filePath.path });
      if (file.encoding !== "base64") {
        throw new Error(
          `File ${file.name} is not base64 encoded, it is ${file.encoding}`,
        );
      }
      const rawContent = Buffer.from(file.content, "base64").toString("utf-8");
      const { data, content } = parseMarkdownFrontmatter(rawContent);
      const parsedData = schema.parse(data);
      return {
        id: parsedData.slug,
        body: content,
        data: parsedData,
      };
    }),
  );
  return files;
}

function parseMarkdownFrontmatter(markdown: string) {
  const match = /^---\n([\s\S]+?)\n---\n?/m.exec(markdown);
  if (!match) return { data: {}, content: markdown };

  const yamlStr = match[1];
  const content = markdown.slice(match[0].length);

  const data = yaml.load(yamlStr);
  return { data, content };
}
