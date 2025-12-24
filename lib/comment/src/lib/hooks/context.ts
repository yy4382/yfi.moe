import { createContext, useContext, type RefObject } from "react";
import type { HonoClient } from "@/lib/api/create-client";
import type { AuthClient } from "@/lib/auth/create-auth";

export const PathnameContext = createContext<string>("");

export const ServerURLContext = createContext<string>("");
export const AuthClientRefContext = createContext<RefObject<AuthClient>>(null!);
export const HonoClientRefContext = createContext<RefObject<HonoClient>>(null!);

export function useAuthClient() {
  return useContext(AuthClientRefContext).current;
}
export function useHonoClient() {
  return useContext(HonoClientRefContext).current;
}
export function usePathname() {
  return useContext(PathnameContext);
}
