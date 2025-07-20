import { t } from "elysia";

export const getCommentsBody = t.Object({
  path: t.String(),
  limit: t.Number({ maximum: 25, minimum: 1 }).default(10),
  offset: t.Number().default(0),
});

export const getCommentsResponseUser = t.Object({
  id: t.Number(),
  content: t.String(),
  parentId: t.Nullable(t.Number()),
  replyToId: t.Nullable(t.Number()),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
  userImage: t.String(),
  displayName: t.String(),
  path: t.String(),
});

export type GetCommentsResponseUser = typeof getCommentsResponseUser.static;

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

export const getCommentsResponseAdmin = t.Intersect([
  getCommentsResponseUser,
  getCommentsResponseAdminExtra,
]);
export type GetCommentsResponseAdmin = typeof getCommentsResponseAdmin.static;

export const getCommentsResponse = t.Union([
  getCommentsResponseUser,
  getCommentsResponseAdmin,
]);
export type GetCommentsResponse = typeof getCommentsResponse.static;
