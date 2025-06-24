import { useQuery } from "@tanstack/react-query";
import { usePathname } from "@utils/hooks/usePathname";
import {
  commentDataAdminSchema,
  commentDataUserSchema,
  type CommentDataAdmin,
  type CommentDataUser,
} from "@repo/api-datatypes/comment";
import z from "zod/v4";
import { CommentEntry } from "./commnet-entry";

export function CommentList() {
  const pathname = usePathname();
  const { data, isPending, error } = useQuery({
    queryKey: ["comments", pathname],
    queryFn: async (): Promise<CommentDataAdmin[] | CommentDataUser[]> => {
      const response = await fetch(
        `/api/comments/${encodeURIComponent(pathname)}`,
      );
      const data = await response.json();
      const adminData = z.array(commentDataAdminSchema).safeParse(data);
      if (adminData.success) return adminData.data;
      const userData = z.array(commentDataUserSchema).safeParse(data);
      if (userData.success) return userData.data;
      console.error(userData.error, data);
      throw new Error("Invalid comment data", { cause: data });
    },
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div>
      {data.map((comment) => (
        <CommentEntry key={comment.id} entry={comment} />
      ))}
    </div>
  );
}
