import { factory } from "@/factory.js";
import { unsubscribeApp } from "./unsubscribe/unsub.js";

export const accountApp = factory
  .createApp()
  .route("/notification", unsubscribeApp);
