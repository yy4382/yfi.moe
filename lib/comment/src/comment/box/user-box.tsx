import * as stylex from "@stylexjs/stylex";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, type PropsWithChildren } from "react";
import { toast } from "sonner";
import MingcuteCloseLine from "~icons/mingcute/close-line";
import GitHubIcon from "~icons/mingcute/github-line";
import { getDiceBearUrl } from "@repo/helpers/get-gravatar-url";
import type { AuthClient } from "@/lib/auth/create-auth";
import { sessionOptionsKey } from "@/lib/auth/session-options";
import { useAuthClient } from "@/lib/hooks/context";
import { styles, userMarker } from "./user-box.stylex";

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
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(userMarker, styles.avatarContainer)}>
        <img
          src={session.user.image ?? getDiceBearUrl(session.user.email)}
          alt={session.user.name}
          width={56}
          height={56}
          {...stylex.props(styles.avatar)}
        />
        <div {...stylex.props(styles.signOut)}>
          <button
            aria-label="退出登录"
            onClick={() => void handleSignOut()}
            {...stylex.props(styles.center)}
          >
            <MingcuteCloseLine {...stylex.props(styles.signOutIcon)} />
          </button>
        </div>
        {!isAccountsError &&
          !isAccountsPending &&
          accounts?.data?.find(
            (account) => account.providerId === "github",
          ) && (
            <span {...stylex.props(styles.githubBadge)}>
              <GitHubIcon {...stylex.props(styles.githubIcon)} />
            </span>
          )}
      </div>
      {children}
    </div>
  );
}
