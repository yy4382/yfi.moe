import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { produce } from "immer";
import { atom, type PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type {
  GetCommentsChildrenResponse,
  LayeredCommentData,
} from "@repo/api/comment/get.model";
import {
  commentUpdateParamsBranded,
  type CommentUpdateParamsBranded,
  updateComment,
} from "@/lib/api/comment/update";
import { sessionOptions } from "@/lib/auth/session-options";
import { useAuthClient, useHonoClient, usePathname } from "@/lib/hooks/context";
import { sortByAtom } from "../atoms";
import { CommentBoxIdContext } from "./context";
import { InputBox } from "./input-area";

function useUpdateComment({
  editId,
  contentAtom,
  onSuccess,
}: {
  editId: number;
  contentAtom: PrimitiveAtom<string>;
  onSuccess?: () => void;
}) {
  const path = usePathname();
  const queryClient = useQueryClient();
  const authClient = useAuthClient();
  const { data: session } = useQuery(sessionOptions(authClient));
  const sortBy = useAtomValue(sortByAtom);
  const setContent = useSetAtom(contentAtom);
  const mutationKey = ["editComment", editId];
  const honoClient = useHonoClient();
  const mutation = useMutation({
    mutationKey,
    mutationFn: (params: CommentUpdateParamsBranded) =>
      updateComment(params, honoClient),
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
            draft.pages.some((page) => {
              return page.comments.some((rootComment) => {
                if (rootComment.data.id === data.id) {
                  rootComment.data = data;
                  return true;
                }
                return rootComment.children.data.some(
                  (childComment, childCommentIndex) => {
                    if (childComment.id === data.id) {
                      rootComment.children.data[childCommentIndex] = data;
                      return true;
                    }
                  },
                );
              });
            });
          });
        },
      );
      if (data.parentId) {
        queryClient.setQueryData(
          [
            "comments",
            { session: session?.user.id },
            path,
            sortBy,
            data.parentId,
          ],
          (old: InfiniteData<GetCommentsChildrenResponse>) => {
            return produce(old, (draft) => {
              draft.pages.some((page) => {
                return page.data.some((comment, i) => {
                  if (comment.id === data.id) {
                    page.data[i] = data;
                    return true;
                  }
                });
              });
            });
          },
        );
      }

      void queryClient.invalidateQueries({
        queryKey: ["comments", { session: session?.user.id }, path],
      });
      setContent("");
      onSuccess?.();
    },
  });
  return [mutation, mutationKey] as const;
}

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
  const path = usePathname();
  const [contentAtom] = useState<PrimitiveAtom<string>>(() =>
    atom(initialContent),
  );
  const content = useAtomValue(contentAtom);
  const [{ mutate }, mutationKey] = useUpdateComment({
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
