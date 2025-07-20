import { Static, t } from "elysia";

export const addCommentBody = t.Object({
  path: t.String(),
  content: t.String({ minLength: 1, maxLength: 500 }),
  parentId: t.Optional(t.Number()),
  replyToId: t.Optional(t.Number()),
  anonymousName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  visitorName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  visitorEmail: t.Optional(t.String({ format: "email" })),
});
export type AddCommentBody = Static<typeof addCommentBody>;

export const addCommentResponse = t.Object({
  id: t.Number(),
});
export type AddCommentResponse = Static<typeof addCommentResponse>;
