import { MaskIcon } from "#/components/ui/mask-icon";
import type { AuthClient } from "#/lib/auth/create-auth";
import { sessionOptionsKey } from "#/lib/auth/session-options";
import { useAuthClient } from "#/lib/hooks/context";
import * as stylex from "@stylexjs/stylex";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, type PropsWithChildren } from "react";
import { toast } from "sonner";
import { colors, radii, spacing } from "@repo/design-tokens/tokens.stylex";
import { getDiceBearUrl } from "@repo/helpers/get-gravatar-url";

type UserBoxProps = PropsWithChildren<{
  session: AuthClient["$Infer"]["Session"];
}>;

export function UserBox({ children, session }: UserBoxProps) {
  const queryClient = useQueryClient();
  const authClient = useAuthClient();
  const {
    data: accounts,
    isPending: isAccountsPending,
    isError: isAccountsError,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => authClient.listAccounts(),
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

  const hasGitHubAccount =
    !isAccountsError &&
    !isAccountsPending &&
    accounts?.data?.some((account) => account.providerId === "github");

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.avatarWrap)}>
        <img
          src={session.user.image ?? getDiceBearUrl(session.user.email)}
          alt={session.user.name}
          width={56}
          height={56}
          {...stylex.props(styles.avatar)}
        />
        <button
          type="button"
          aria-label="退出登录"
          onClick={() => void handleSignOut()}
          {...stylex.props(styles.signOut)}
        >
          <MaskIcon name="close-line" stylexStyle={styles.closeIcon} />
        </button>
        {hasGitHubAccount && (
          <span {...stylex.props(styles.providerBadge)}>
            <MaskIcon name="github-line" stylexStyle={styles.providerIcon} />
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const styles = stylex.create({
  root: {
    alignItems: "flex-end",
    display: "flex",
    gap: spacing.lg,
    width: "100%",
  },
  avatarWrap: { flexShrink: 0, marginBottom: spacing.sm, position: "relative" },
  avatar: {
    aspectRatio: "1",
    borderRadius: radii.round,
    height: "3.5rem",
    objectFit: "cover",
    outlineColor: colors.textPrimary,
    outlineStyle: "solid",
    outlineWidth: "2px",
    width: "3.5rem",
  },
  signOut: {
    alignItems: "center",
    backgroundColor: colors.overlayScrim,
    border: 0,
    borderRadius: radii.md,
    color: colors.surface,
    cursor: "pointer",
    display: "flex",
    height: "1rem",
    justifyContent: "center",
    opacity: 0.62,
    padding: spacing.xxs,
    position: "absolute",
    right: "-0.25rem",
    top: "-0.25rem",
    width: "1rem",
    ":hover": { opacity: 1 },
    ":focus-visible": { opacity: 1 },
  },
  providerBadge: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: radii.round,
    bottom: "-0.25rem",
    color: "black",
    display: "flex",
    justifyContent: "center",
    padding: spacing.xxs,
    position: "absolute",
    right: "-0.25rem",
  },
  closeIcon: { height: "0.625rem", width: "0.625rem" },
  providerIcon: { height: "0.875rem", width: "0.875rem" },
});
