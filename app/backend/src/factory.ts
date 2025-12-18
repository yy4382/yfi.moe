import { createFactory } from "hono/factory";
import type { RequestIdVariables } from "hono/request-id";
import type * as pino from "pino";
import type { Session, User } from "@/auth/auth-plugin.js";
import type { AuthClient } from "@/auth/create-auth.js";
import type { DbClient } from "@/db/db-plugin.js";
import type { AnonymousIdentity } from "./plugins/anonymous-identity.js";
import type { AkismetService } from "./services/akismet.js";
import type { NotificationService } from "./services/notification/types.js";

export type Variables = {
  db: DbClient;
  auth?: {
    user: User;
    session: Session;
  };
  authClient: AuthClient;

  notification: NotificationService;
  akismet: AkismetService | null;

  logger: pino.Logger;
  anonymousIdentity: AnonymousIdentity;
} & RequestIdVariables;

export const factory = createFactory<{
  Variables: Variables;
}>();
