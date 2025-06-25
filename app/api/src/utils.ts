import { parseMarkdown } from "@repo/markdown/basic";
import { Hono } from "hono";

export const utils = new Hono();

utils.post("/getMarkdown", async (c) => {
  const { markdown } = await c.req.json();
  try {
    const html = await parseMarkdown(markdown);
    return c.json({ html });
  } catch (error) {
    return c.json({ error: "Failed to parse markdown" }, 500);
  }
});
