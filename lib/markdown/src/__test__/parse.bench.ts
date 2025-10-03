import fs from "fs";
import path from "path";
import { bench, describe } from "vitest";
import { markdownToHtml } from "../parse.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const content = fs.readFileSync(
  path.join(__dirname, "example-prose.md"),
  "utf-8",
);
const content2 = fs.readFileSync(
  path.join(__dirname, "example-code.md"),
  "utf-8",
);

describe("markdownToHtml", () => {
  bench(
    "markdownToHtml: mainly prose",
    () => {
      markdownToHtml(content);
    },
    { iterations: 20, warmupIterations: 3 },
  );

  bench(
    "markdownToHtml: mainly code",
    () => {
      markdownToHtml(content2);
    },
    { iterations: 20, warmupIterations: 3 },
  );
});
