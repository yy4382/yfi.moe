import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionOptions, sortByAtom } from "../utils";
import z from "zod";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { CommentBoxIdContext, CommentBoxStatusContext } from "./context";
import { InputBox } from "./input-area";
import {
  commentUpdateParamsBranded,
  updateComment,
} from "../comment-api/update";
import { useAtomValue } from "jotai";
import { LayeredCommentData } from "@/lib/hono/models";
import { produce } from "immer";

export function CommentBoxEdit({
  editId,
  initialContent,
  onCancel,
  onSuccess,
}: {
  editId: number;
  initialContent: string;
  onCancel: () => void;
  onSuccess?: () => void;
}) {
  const path = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useQuery(sessionOptions());
  const sortBy = useAtomValue(sortByAtom);
  const { mutate, status, reset } = useMutation({
    mutationFn: updateComment,
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ["comments", { session: session?.user.id }, path, sortBy],
        (old: {
          pages: { comments: LayeredCommentData[]; total: number }[];
        }) => {
          return produce(old, (draft) => {
            for (let i = 0; i < old.pages.length; i++) {
              for (let j = 0; j < old.pages[i].comments.length; j++) {
                if (old.pages[i].comments[j].id === data.id) {
                  draft.pages[i].comments[j] = {
                    ...data,
                    children: old.pages[i].comments[j].children,
                  };
                  return;
                }
                for (
                  let k = 0;
                  k < old.pages[i].comments[j].children.length;
                  k++
                ) {
                  if (old.pages[i].comments[j].children[k].id === data.id) {
                    draft.pages[i].comments[j].children[k] = data;
                    return;
                  }
                }
              }
            }
          });
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["comments", { session: session?.user.id }, path],
      });
      onSuccess?.();
    },
  });

  const handleSubmit = (content: string, opt: { onSuccess: () => void }) => {
    const parsed = commentUpdateParamsBranded.safeParse({
      id: editId,
      content,
    });
    if (!parsed.success) {
      toast.error(z.prettifyError(parsed.error));
      return;
    }
    mutate(parsed.data, opt);
  };

  return (
    <CommentBoxIdContext value={{ editId, path }}>
      <CommentBoxStatusContext value={{ status, reset, cancel: onCancel }}>
        <InputBox submit={handleSubmit} initialContent={initialContent} />
      </CommentBoxStatusContext>
    </CommentBoxIdContext>
  );
}
