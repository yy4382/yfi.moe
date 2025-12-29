import { factory } from "../../../factory.js";
import { getStatus } from "../services/git.service.js";

export const gitStatusRoute = factory.createApp().get("/status", async (c) => {
  const status = await getStatus();
  return c.json({ status });
});
