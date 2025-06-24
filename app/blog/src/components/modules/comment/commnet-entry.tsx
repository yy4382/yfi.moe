import type {
  CommentDataAdmin,
  CommentDataUser,
} from "@repo/api-datatypes/comment";

export function CommentEntry({
  entry,
}: {
  entry: CommentDataAdmin | CommentDataUser;
}) {
  return (
    <div>
      <div>{entry.content}</div>
      <div>{entry.createdAt.toLocaleString()}</div>
    </div>
  );
}
