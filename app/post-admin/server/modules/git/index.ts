import { factory } from "../../factory.js";
import { gitStatusRoute } from "./routes/status.js";
import { gitSyncRoute } from "./routes/sync.js";

export const gitRoutes = factory
  .createApp()
  .route("/", gitStatusRoute)
  .route("/", gitSyncRoute);
