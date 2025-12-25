import { useQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { commentAddParamsBranded } from "@/lib/api/comment/add";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, usePathname } from "@/lib/hooks/context";
import { persistentEmailAtom, persistentNameAtom } from "../atoms";
import { useAddComment } from "../hooks/use-add-comment";
import { useCommentFormAtoms } from "../hooks/use-comment-form";
import type { CommentBoxId, ReplyContext } from "../types";
import { commentKeys } from "../utils/query-keys";
import { CommentBoxIdContext } from "./context";
import { InputBox } from "./input-box";
import { UserBox } from "./user-box";
import { VisitorBox } from "./visitor-box";

interface CommentBoxNewProps {
  reply?: ReplyContext;
  onSuccess?: () => void;
}

/**
 * Main comment input box for creating new comments.
 *
 * Renders different UIs for:
 * - Logged-in users (with avatar and anonymous option)
 * - Visitors (with name/email inputs)
 */
export function CommentBoxNew({ reply, onSuccess }: CommentBoxNewProps) {
  const path = usePathname();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));

  const commentBoxId: CommentBoxId = {
    parentId: reply?.parentId,
    replyingTo: reply?.replyToId,
    path,
  };

  const { contentAtom, isAnonymousAtom } = useCommentFormAtoms();

  const [content, setContent] = useAtom(contentAtom);
  const isAnonymous = useAtomValue(isAnonymousAtom);
  const visitorEmail = useAtomValue(persistentEmailAtom);
  const visitorName = useAtomValue(persistentNameAtom);

  const data = useMemo(() => {
    return {
      content,
      isAnonymous,
      ...(session ? {} : { visitorEmail, visitorName }),
    };
  }, [content, isAnonymous, visitorEmail, visitorName, session]);

  const { mutate } = useAddComment({
    onSuccess,
    id: commentBoxId,
  });

  const handleSubmit = useCallback(() => {
    const { data: parsedData, error } = commentAddParamsBranded.safeParse({
      path,
      replyToId: reply?.replyToId,
      parentId: reply?.parentId,
      ...data,
    });
    if (error) {
      const firstError = error.issues[0];
      toast.error(firstError?.message);
      return;
    }
    mutate(parsedData, {
      onSuccess: () => {
        setContent("");
      },
    });
  }, [mutate, reply?.parentId, reply?.replyToId, path, data, setContent]);

  const replyPlaceholder = reply?.at ? `回复 @${reply.at}：` : undefined;

  return (
    <CommentBoxIdContext value={commentBoxId}>
      {session ? (
        <UserBox session={session}>
          <InputBox
            submit={handleSubmit}
            contentAtom={contentAtom}
            isAnonymousAtom={isAnonymousAtom}
            mutationKey={commentKeys.mutations.add(commentBoxId)}
            placeholder={replyPlaceholder}
          />
        </UserBox>
      ) : (
        <VisitorBox>
          <InputBox
            submit={handleSubmit}
            contentAtom={contentAtom}
            mutationKey={commentKeys.mutations.add(commentBoxId)}
            placeholder={
              replyPlaceholder ??
              "注册后可以编辑、删除留言，并且通过邮件获取回复通知哦"
            }
          />
        </VisitorBox>
      )}
    </CommentBoxIdContext>
  );
}

// Re-export for convenience
export { CommentBoxEdit } from "./edit-comment";
