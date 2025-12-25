import { useQuery } from "@tanstack/react-query";
import MingcuteDelete3Line from "~icons/mingcute/delete-3-line";
import MingcuteEditLine from "~icons/mingcute/edit-line";
import MoreIcon from "~icons/mingcute/more-1-line";
import MingcuteShieldShapeLine from "~icons/mingcute/shield-shape-line";
import type { CommentData } from "@repo/api/comment/comment-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient } from "@/lib/hooks/context";
import { useDeleteComment } from "../hooks/use-delete-comment";
import { useToggleSpam } from "../hooks/use-toggle-spam";

interface CommentDropdownProps {
  comment: CommentData;
  onEdit: () => void;
}

/**
 * Dropdown menu for comment actions (edit, delete, toggle spam).
 * Only visible to comment owner or admin.
 */
export function CommentDropdown({ comment, onEdit }: CommentDropdownProps) {
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));

  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: toggleSpam } = useToggleSpam();

  const isMine =
    session && comment.userId && comment.userId === session.user.id;
  const isAdmin = session?.user.role === "admin";

  // Only show dropdown for owners or admins
  if (!isMine && !isAdmin) {
    return <div></div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isMine && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <MingcuteEditLine />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteComment(comment.id)}>
              <MingcuteDelete3Line />
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
            <MingcuteShieldShapeLine />
            {comment.isSpam ? "标记为正常" : "标记为垃圾"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
