import { sessionQueryOptions } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const authData = useQuery(sessionQueryOptions);
  const user = authData.data?.user;

  if (user) {
    return <Navigate to="/users" />;
  }

  return <Navigate to="/login" />;
}
