import yaml from "js-yaml";

function isFrontmatterValid(frontmatter: unknown) {
  try {
    JSON.stringify(frontmatter);
  } catch {
    return false;
  }
  return typeof frontmatter === "object" && frontmatter !== null;
}
const frontmatterRE =
  /(?:^\uFEFF?|^\s*\n)(?:---|\+\+\+)([\s\S]*?\n)(?:---|\+\+\+)/;
const frontmatterTypeRE = /(?:^\uFEFF?|^\s*\n)(---|\+\+\+)/;

function extractFrontmatter(code: string) {
  return frontmatterRE.exec(code)?.[1];
}

function getFrontmatterParser(code: string) {
  if (frontmatterTypeRE.exec(code)?.[1] === "+++") {
    throw new Error("TOML frontmatter is not supported");
  }
  return ["---", yaml.load] as const;
}
function parseFrontmatter(
  code: string,
  options: {
    frontmatter:
      | "remove"
      | "preserve"
      | "empty-with-spaces"
      | "empty-with-lines";
  },
) {
  const rawFrontmatter = extractFrontmatter(code);
  if (rawFrontmatter == null) {
    return { frontmatter: {}, rawFrontmatter: "", content: code };
  }
  const [delims, parser] = getFrontmatterParser(code);
  const parsed = parser(rawFrontmatter);
  const frontmatter = parsed && typeof parsed === "object" ? parsed : {};
  let content;
  switch (options?.frontmatter ?? "remove") {
    case "preserve":
      content = code;
      break;
    case "remove":
      content = code.replace(`${delims}${rawFrontmatter}${delims}`, "");
      break;
    case "empty-with-spaces":
      content = code.replace(
        `${delims}${rawFrontmatter}${delims}`,
        `   ${rawFrontmatter.replace(/[^\r\n]/g, " ")}   `,
      );
      break;
    case "empty-with-lines":
      content = code.replace(
        `${delims}${rawFrontmatter}${delims}`,
        rawFrontmatter.replace(/[^\r\n]/g, ""),
      );
      break;
  }
  return {
    frontmatter,
    rawFrontmatter,
    content,
  };
}

export { parseFrontmatter, isFrontmatterValid };
