import { env } from "@/env.js";
import { factory } from "@/factory.js";
import { logger as rawLogger } from "@/logger.js";
import { AkismetService } from "./akismet.js";

const logger = rawLogger.child({
  module: "akismet",
});

// undefined means not initialized yet
// null means disabled
let akismetServiceSingleton: AkismetService | null | undefined = undefined;

function getAkismetService() {
  if (akismetServiceSingleton !== undefined) {
    return akismetServiceSingleton;
  }
  if (env.AKISMET_KEY && env.AKISMET_BLOG) {
    // Enable test mode when FRONTEND_URL origin contains localhost
    const frontendUrl = new URL(env.FRONTEND_URL);
    const isTest =
      frontendUrl.hostname === "localhost" ||
      frontendUrl.hostname === "127.0.0.1";

    akismetServiceSingleton = new AkismetService({
      key: env.AKISMET_KEY,
      blog: env.AKISMET_BLOG,
      isTest,
    });
  } else {
    logger.warn("Akismet is not enabled");
    akismetServiceSingleton = null;
  }
  return akismetServiceSingleton;
}

export const akismetPlugin = factory.createMiddleware(async (c, next) => {
  const akismetService = getAkismetService();
  c.set("akismet", akismetService);
  await next();
});
