import { t, type Static } from "elysia";

export const getCommentsBody = t.Object({
  path: t.String(),
  limit: t.Number({ maximum: 25, minimum: 1 }),
  offset: t.Number(),
  sortBy: t.Union([t.Literal("created_desc"), t.Literal("created_asc")]),
});

export type GetCommentsBody = Static<typeof getCommentsBody>;

export const commentDataUser = t.Object({
  id: t.Number(),
  content: t.String(),
  parentId: t.Nullable(t.Number()),
  replyToId: t.Nullable(t.Number()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  userImage: t.String(),
  displayName: t.String(),
  path: t.String(),
});

export type CommentDataUser = Static<typeof commentDataUser>;

const getCommentsResponseAdminExtra = t.Object({
  userId: t.Nullable(t.String()),
  userIp: t.Nullable(t.String()),
  userAgent: t.Nullable(t.String()),
  userName: t.Nullable(t.String()),
  userEmail: t.Nullable(t.String({ format: "email" })),
  anonymousName: t.Nullable(t.String()),
  visitorName: t.Nullable(t.String()),
  visitorEmail: t.Nullable(t.String({ format: "email" })),
});

export const commentDataAdmin = t.Intersect([
  commentDataUser,
  getCommentsResponseAdminExtra,
]);
export type CommentDataAdmin = typeof commentDataAdmin.static;

export const layeredComment = <
  T extends typeof commentDataAdmin | typeof commentDataUser,
>(
  data: T,
) => {
  return t.Intersect([data, t.Object({ children: t.Array(data) })]);
};

export type LayeredComment<T extends CommentDataAdmin | CommentDataUser> = T & {
  children: T[];
};

export const layeredCommentDataAdmin = layeredComment(commentDataAdmin);
export const layeredCommentDataUser = layeredComment(commentDataUser);

export const layeredCommentList = t.Array(
  t.Union([layeredCommentDataAdmin, layeredCommentDataUser]),
);
export type LayeredCommentList = typeof layeredCommentList.static;

export const getCommentsResponse = t.Object({
  comments: layeredCommentList,
});
export type GetCommentsResponse = typeof getCommentsResponse.static;
