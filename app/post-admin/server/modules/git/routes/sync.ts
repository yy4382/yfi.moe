import { factory } from "../../../factory.js";
import { sync } from "../services/git.service.js";

export const gitSyncRoute = factory.createApp().post("/sync", async (c) => {
  const result = await sync();

  if (!result.success) {
    return c.json({ error: result.message }, 500);
  }

  return c.json({ message: result.message });
});
