import { factory } from "@/lib/hono/factory";
import { sValidator } from "@hono/standard-validator";
import { unsubscribeReq } from "./unsub.model";
import { unsubscribedEmail } from "@/lib/db/schema";
import { verifyUnsubscribeSignature } from "./unsub.service";
import { env } from "@/env";

export const unsubscribeApp = factory
  .createApp()
  .post("/unsubscribe", sValidator("json", unsubscribeReq), async (c) => {
    const body = c.req.valid("json");
    const currentUser = c.get("auth")?.user;
    const db = c.get("db");
    if (currentUser) {
      await db
        .insert(unsubscribedEmail)
        .values({
          email: currentUser.email,
        })
        .onConflictDoNothing();
      return c.json({ success: true }, 200);
    }
    if (!body.credentials) {
      return c.json({ success: false, cause: "no credentials" }, 401);
    }
    const { signature, expiresAtTimestampSec } = body.credentials;
    const result = verifyUnsubscribeSignature(
      body.email,
      signature,
      expiresAtTimestampSec,
      new Date(),
      env.UNSUBSCRIBE_SECRET,
    );
    if (result === "expired") {
      return c.json({ success: false, cause: "expired" }, 400);
    }
    if (result === "invalid") {
      return c.json({ success: false, cause: "invalid" }, 400);
    }
    await db
      .insert(unsubscribedEmail)
      .values({
        email: body.email,
      })
      .onConflictDoNothing();
    return c.json({ success: true }, 200);
  });
