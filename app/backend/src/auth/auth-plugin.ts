import { Elysia } from "elysia";
import { auth } from "./auth";

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount("/better-auth", auth.handler)
  .macro({
    auth: {
      async resolve({ request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return { user: null, session: null };

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
