import type { Session, User } from "@/auth/auth-plugin";
import type { AuthClient } from "@/auth/create-auth";
import type { DbClient } from "@/db/db-plugin";
import { createFactory } from "hono/factory";
import type { HttpBindings } from "@hono/node-server";

export type Variables = {
  db: DbClient;
  auth?: {
    user: User;
    session: Session;
  };
  authClient: AuthClient;
};

export const factory = createFactory<{
  Variables: Variables;
  Bindings: HttpBindings;
}>();
