import { createFactory } from "hono/factory";

export type Variables = {
  isAuthenticated: boolean;
};

export const factory = createFactory<{
  Variables: Variables;
}>();
