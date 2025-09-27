import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { atom, type PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { LayeredCommentData } from "@repo/api/comment/get.model";
import {
  commentUpdateParamsBranded,
  type CommentUpdateParamsBranded,
  updateComment,
} from "../comment-api/update";
import {
  AuthClientRefContext,
  PathnameContext,
  ServerURLContext,
} from "../context";
import { sessionOptions, sortByAtom } from "../utils";
import { CommentBoxIdContext } from "./context";
import { InputBox } from "./input-area";

export function CommentBoxEdit({
  editId,
  onCancel,
  onSuccess,
  initialContent,
}: {
  editId: number;
  initialContent: string;
  onCancel: () => void;
  onSuccess?: () => void;
}) {
  const path = useContext(PathnameContext);
  const queryClient = useQueryClient();
  const authClient = useContext(AuthClientRefContext).current;
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);
  const [contentAtom] = useState<PrimitiveAtom<string>>(() =>
    atom(initialContent),
  );
  const [content, setContent] = useAtom(contentAtom);
  const mutationKey = ["editComment", editId];
  const serverURL = useContext(ServerURLContext);
  const { mutate } = useMutation({
    mutationKey,
    mutationFn: (params: CommentUpdateParamsBranded) =>
      updateComment(params, serverURL),
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
              for (let j = 0; j < old.pages[i]!.comments.length; j++) {
                if (old.pages[i]!.comments[j]!.data.id === data.id) {
                  draft.pages[i]!.comments[j] = {
                    data: data,
                    children: old.pages[i]!.comments[j]!.children,
                  };
                  return;
                }
                for (
                  let k = 0;
                  k < old.pages[i]!.comments[j]!.children.data.length;
                  k++
                ) {
                  if (
                    old.pages[i]!.comments[j]!.children.data[k]!.id === data.id
                  ) {
                    draft.pages[i]!.comments[j]!.children.data[k] = data;
                    return;
                  }
                }
              }
            }
          });
        },
      );
      void queryClient.invalidateQueries({
        queryKey: ["comments", { session: session?.user.id }, path],
      });
      setContent("");
      onSuccess?.();
    },
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
    mutate(parsed.data);
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
