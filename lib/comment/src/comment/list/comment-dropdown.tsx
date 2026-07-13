import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { MaskIcon } from "#/components/ui/mask-icon";
import { sessionOptions } from "#/lib/auth/session-options";
import { useAuthClient } from "#/lib/hooks/context";
import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";
import type { CommentData } from "@repo/api/comment/comment-data";
import { colors, radii, spacing } from "@repo/design-tokens/tokens.stylex";
import { useDeleteComment } from "../hooks/use-delete-comment";
import { useToggleSpam } from "../hooks/use-toggle-spam";

export function CommentDropdown({
  comment,
  onEdit,
}: {
  comment: CommentData;
  onEdit: () => void;
}) {
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: toggleSpam } = useToggleSpam();
  const isAdmin = session?.user.role === "admin";

  if (!comment.ownedByViewer && !isAdmin) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="更多评论操作"
        {...stylex.props(styles.trigger)}
      >
        <MaskIcon name="more-1-line" stylexStyle={styles.icon} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {comment.ownedByViewer && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <MaskIcon name="edit-line" stylexStyle={styles.icon} />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => deleteComment(comment.id)}
            >
              <MaskIcon name="delete-3-line" stylexStyle={styles.icon} />
              删除
            </DropdownMenuItem>
          </>
        )}
        {isAdmin && typeof comment.isSpam === "boolean" && (
          <DropdownMenuItem
            onClick={() =>
              toggleSpam({ id: comment.id, isSpam: !comment.isSpam })
            }
          >
            <MaskIcon name="shield-shape-line" stylexStyle={styles.icon} />
            {comment.isSpam ? "标记为正常" : "标记为垃圾"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const styles = stylex.create({
  trigger: {
    alignItems: "center",
    backgroundColor: "transparent",
    border: 0,
    borderRadius: radii.md,
    color: colors.textMuted,
    cursor: "pointer",
    display: "inline-flex",
    justifyContent: "center",
    padding: spacing.xs,
    ":hover": { backgroundColor: colors.surfaceInteractiveHover },
    ":focus-visible": {
      outlineColor: colors.focusRing,
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  },
  icon: { height: "1rem", width: "1rem" },
});
