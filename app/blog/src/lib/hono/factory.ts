import type { Session, User } from "@/lib/auth/auth-plugin";
import type { AuthClient } from "@/lib/auth/create-auth";
import type { DbClient } from "@/lib/db/db-plugin";
import { createFactory } from "hono/factory";
import { NotificationService } from "./notification/types";

export type Variables = {
  db: DbClient;
  auth?: {
    user: User;
    session: Session;
  };
  authClient: AuthClient;

  notification: NotificationService;
};

export const factory = createFactory<{
  Variables: Variables;
}>();
