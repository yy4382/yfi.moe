import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, type PropsWithChildren } from "react";
import { toast } from "sonner";
import MingcuteCloseLine from "~icons/mingcute/close-line";
import GitHubIcon from "~icons/mingcute/github-line";
import { getDiceBearUrl } from "@repo/helpers/get-gravatar-url";
import type { AuthClient } from "@/lib/auth/create-auth";
import { sessionOptionsKey } from "@/lib/auth/session-options";
import { useAuthClient } from "@/lib/hooks/context";

type UserBoxProps = PropsWithChildren<{
  session: AuthClient["$Infer"]["Session"];
}>;

/**
 * Container for logged-in users showing their avatar and sign-out option.
 */
export function UserBox({ children, session }: UserBoxProps) {
  const queryClient = useQueryClient();
  const authClient = useAuthClient();

  const {
    data: accounts,
    isPending: isAccountsPending,
    isError: isAccountsError,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const accounts = await authClient.listAccounts();
      return accounts;
    },
  });

  const handleSignOut = useCallback(async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    void queryClient.invalidateQueries(sessionOptionsKey);
    void queryClient.invalidateQueries({ queryKey: ["comments"] });
  }, [queryClient, authClient]);

  return (
    <div className="flex w-full items-end gap-4">
      <div className="group relative mb-2 shrink-0">
        <img
          src={session.user.image ?? getDiceBearUrl(session.user.email)}
          alt={session.user.name}
          width={56}
          height={56}
          className="aspect-square size-14 rounded-full ring-2 ring-black dark:ring-white"
        />
        <div className="absolute -top-1 -right-1 z-10 hidden size-4 rounded-md bg-zinc-500/50 p-0.5 group-hover:block">
          <button
            onClick={() => void handleSignOut()}
            className="flex size-full items-center justify-center"
          >
            <MingcuteCloseLine className="size-2.5" />
          </button>
        </div>
        {!isAccountsError &&
          !isAccountsPending &&
          accounts?.data?.find(
            (account) => account.providerId === "github",
          ) && (
            <span className="absolute -right-1 -bottom-1 z-10 flex items-center justify-center rounded-full bg-white p-0.5 pb-0 ring-1 dark:ring-black">
              <GitHubIcon className="size-3.5 text-black" />
            </span>
          )}
      </div>
      {children}
    </div>
  );
}
