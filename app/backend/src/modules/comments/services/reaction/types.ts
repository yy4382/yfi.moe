import type { User } from "@/auth/auth-plugin.js";

export type ReactionActor =
  | { type: "user"; id: User["id"]; role: User["role"] }
  | { type: "anonymous"; key: string };

export function actorFromUser(user: User): ReactionActor {
  return {
    type: "user",
    id: user.id,
    role: user.role,
  };
}
