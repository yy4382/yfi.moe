import { useAtomValue } from "jotai";
import { toast } from "sonner";
import { z } from "zod";
import { commentUpdateParamsBranded } from "@/lib/api/comment/update";
import { usePathname } from "@/lib/hooks/context";
import { useCommentFormAtoms } from "../hooks/use-comment-form";
import { useUpdateComment } from "../hooks/use-update-comment";
import { CommentBoxIdContext } from "./context";
import { InputBox } from "./input-box";

interface CommentBoxEditProps {
  editId: number;
  initialContent: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

/**
 * Comment edit box for modifying existing comments.
 * Pre-populates with the original content.
 */
export function CommentBoxEdit({
  editId,
  onCancel,
  onSuccess,
  initialContent,
}: CommentBoxEditProps) {
  const path = usePathname();
  const { contentAtom } = useCommentFormAtoms(initialContent);
  const content = useAtomValue(contentAtom);

  const { mutation, mutationKey } = useUpdateComment({
    editId,
    contentAtom,
    onSuccess,
  });

  const handleSubmit = () => {
    const parsed = commentUpdateParamsBranded.safeParse({
      id: editId,
      content,
    });
    if (!parsed.success) {
      toast.error(z.prettifyError(parsed.error));
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <CommentBoxIdContext value={{ editId, path }}>
      <InputBox
        contentAtom={contentAtom}
        submit={handleSubmit}
        onCancel={onCancel}
        mutationKey={mutationKey}
      />
    </CommentBoxIdContext>
  );
}
