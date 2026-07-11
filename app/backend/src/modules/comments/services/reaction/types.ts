import type { User } from "@/auth/auth-plugin.js";

export type ReactionActor =
  | { type: "user"; id: User["id"] }
  | { type: "guest"; key: string };

export function actorFromUser(user: User): ReactionActor {
  return {
    type: "user",
    id: user.id,
  };
}
