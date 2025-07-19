import Posthog from "posthog-js-lite";
import { siteDomain } from "./config/site";

export let posthog: Posthog | null = null;
if (
  typeof window !== "undefined" &&
  window.location.origin === siteDomain &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_POSTHOG_HOST
) {
  posthog = new Posthog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    captureHistoryEvents: true,
    persistence: "localStorage",
  });
}
