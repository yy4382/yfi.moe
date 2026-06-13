import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/achieve")({
  loader: () => {
    throw redirect({ to: "/archive" });
  },
});
