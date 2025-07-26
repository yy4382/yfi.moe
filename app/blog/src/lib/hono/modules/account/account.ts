import { factory } from "@/lib/hono/factory";
import { unsubscribeApp } from "./unsubscribe/unsub";

export const accountApp = factory
  .createApp()
  .route("/notification", unsubscribeApp);
