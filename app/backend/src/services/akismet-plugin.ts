import { factory } from "@/factory.js";
import { AkismetService } from "./akismet.js";
import { env } from "@/env.js";

export const akismetPlugin = factory.createMiddleware(async (c, next) => {
  let akismetService: AkismetService | null = null;

  if (env.AKISMET_KEY && env.AKISMET_BLOG) {
    // Enable test mode when FRONTEND_URL origin contains localhost
    const frontendUrl = new URL(env.FRONTEND_URL);
    const isTest =
      frontendUrl.hostname === "localhost" ||
      frontendUrl.hostname === "127.0.0.1";

    akismetService = new AkismetService({
      key: env.AKISMET_KEY,
      blog: env.AKISMET_BLOG,
      isTest,
    });
  }

  c.set("akismet", akismetService);
  await next();
});
