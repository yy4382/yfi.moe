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
    queryFn: async (): Promise<
      LayeredComment<CommentDataAdmin | CommentDataUser>[]
    > => {
      const response = await fetch(
        `/api/comments/v1/${encodeURIComponent(pathname)}`,
      );
      const data = await response.json();
      const getData = (data: unknown) => {
        const adminData = z.array(commentDataAdminSchema).safeParse(data);
        if (adminData.success) return adminData.data;
        const userData = z.array(commentDataUserSchema).safeParse(data);
        if (userData.success) return userData.data;
        console.error(userData.error, data);
        throw new Error("Invalid comment data", { cause: data });
      };
      return layerComments(getData(data));
    },
  });

  if (isPending)
    return <div className="p-4 text-center text-gray-500">加载评论中...</div>;
  if (error)
    return (
      <div className="p-4 text-center text-red-500">
        加载评论失败: {error.message}
      </div>
    );

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">暂无评论</div>;
  }

  return (
    <div className="space-y-0">
      {data.map((comment) => (
        <div key={comment.id}>
          <CommentEntry entry={comment} />
          {comment.children.length > 0 && (
            <div className="ml-6 pl-4">
              {comment.children.map((children) => (
                <CommentEntry key={children.id} entry={children} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

type LayeredComment<T extends CommentDataAdmin | CommentDataUser> = T & {
  children: T[];
};
function layerComments<T extends CommentDataAdmin | CommentDataUser>(
  comments: T[],
): LayeredComment<T>[] {
  const map = new Map<number, LayeredComment<T> | { children: T[] }>();

  for (const comment of comments) {
    if (comment.parentId === null) {
      map.set(comment.id, {
        ...comment,
        children: map.get(comment.id)?.children ?? [],
      });
    } else {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.children.push(comment);
      } else {
        map.set(comment.parentId, {
          children: [],
        });
      }
    }
  }

  return Array.from(map.values())
    .filter((value): value is LayeredComment<T> => "id" in value)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((entry) => {
      return {
        ...entry,
        children: entry.children.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        ),
      };
    });
}
