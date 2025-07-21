import { queryOptions } from "@tanstack/react-query";
import { authClient } from "@/lib/client";

export function sessionOptions() {
  return queryOptions({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession();
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
  });
}
