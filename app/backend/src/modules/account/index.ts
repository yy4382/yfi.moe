import { factory } from "@/factory.js";
import { unsubscribeApp } from "./routes/unsubscribe.js";

export const accountApp = factory
  .createApp()
  .route("/notification", unsubscribeApp);
