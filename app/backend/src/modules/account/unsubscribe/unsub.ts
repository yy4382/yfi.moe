import { factory } from "@/factory.js";
import { sValidator } from "@hono/standard-validator";
import { unsubscribeReq } from "@repo/api/account/unsub.model";
import { unsubscribedEmail } from "@/db/schema.js";
import { verifyUnsubscribeSignature } from "./unsub.service.js";
import { env } from "@/env.js";
import { eq } from "drizzle-orm";

export const unsubscribeApp = factory
  .createApp()
  .use(
    factory.createMiddleware(async (c, next) => {
      const logger = c.get("logger");
      const childLogger = logger.child({
        module: "subscription",
      });
      c.set("logger", childLogger);
      return next();
    }),
  )
  .post("/unsubscribe", sValidator("json", unsubscribeReq), async (c) => {
    const body = c.req.valid("json");
    const currentUser = c.get("auth")?.user;
    const db = c.get("db");
    const logger = c.get("logger");

    // If credentials are provided, use them first
    if (body.credentials) {
      const { signature, expiresAtTimestampSec } = body.credentials;
      const result = verifyUnsubscribeSignature(
        body.email,
        signature,
        expiresAtTimestampSec,
        new Date(),
        env.UNSUBSCRIBE_SECRET,
      );
      if (result === "expired") {
        logger.info({ ...body }, "Unsubscribe link expired");
        return c.json({ success: false, cause: "expired" }, 400);
      }
      if (result === "invalid") {
        logger.info({ ...body }, "Unsubscribe link invalid");
        return c.json({ success: false, cause: "invalid" }, 400);
      }
      await db
        .insert(unsubscribedEmail)
        .values({
          email: body.email,
        })
        .onConflictDoNothing();
      logger.info({ ...body }, "Unsubscribe success");
      return c.json({ success: true }, 200);
    }

    // If no credentials but user is logged in, use current user
    if (currentUser) {
      await db
        .insert(unsubscribedEmail)
        .values({
          email: currentUser.email,
        })
        .onConflictDoNothing();
      logger.info({ ...body }, "Unsubscribe success");
      return c.json({ success: true }, 200);
    }

    // Neither credentials nor logged in user
    logger.info({ ...body }, "Unsubscribe no credentials or authentication");
    return c.json(
      { success: false, cause: "no credentials or authentication" },
      401,
    );
  })
  .post("/resubscribe", sValidator("json", unsubscribeReq), async (c) => {
    const body = c.req.valid("json");
    const currentUser = c.get("auth")?.user;
    const db = c.get("db");
    const logger = c.get("logger");

    // If credentials are provided, use them first
    if (body.credentials) {
      const { signature, expiresAtTimestampSec } = body.credentials;
      const result = verifyUnsubscribeSignature(
        body.email,
        signature,
        expiresAtTimestampSec,
        new Date(),
        env.UNSUBSCRIBE_SECRET,
      );
      if (result === "expired") {
        logger.info({ ...body }, "Resubscribe link expired");
        return c.json({ success: false, cause: "expired" }, 400);
      }
      if (result === "invalid") {
        logger.info({ ...body }, "Resubscribe link invalid");
        return c.json({ success: false, cause: "invalid" }, 400);
      }
      await db
        .delete(unsubscribedEmail)
        .where(eq(unsubscribedEmail.email, body.email));
      logger.info({ ...body }, "Resubscribe success");
      return c.json({ success: true }, 200);
    }

    // If no credentials but user is logged in, use current user
    if (currentUser) {
      await db
        .delete(unsubscribedEmail)
        .where(eq(unsubscribedEmail.email, currentUser.email));
      logger.info({ ...body }, "Resubscribe success");
      return c.json({ success: true }, 200);
    }

    // Neither credentials nor logged in user
    logger.info({ ...body }, "Resubscribe no credentials or authentication");
    return c.json(
      { success: false, cause: "no credentials or authentication" },
      401,
    );
  });
