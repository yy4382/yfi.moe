import { createAuthClient } from "better-auth/react";
import { admin } from "better-auth/plugins";

export const authClient = createAuthClient({
  plugins: [admin()],
});
