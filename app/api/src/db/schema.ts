import { sql } from "drizzle-orm";
import {
  check,
  integer,
  sqliteTable,
  text,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("user").notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const comment = sqliteTable(
  "comment",
  {
    id: integer("id").primaryKey(),

    rawContent: text("raw_content").notNull(),
    renderedContent: text("rendered_content").notNull(),

    path: text("path").notNull(),
    parentId: integer("parent_id").references(
      (): AnySQLiteColumn => comment.id,
    ),
    replyToId: integer("reply_to_id").references(
      (): AnySQLiteColumn => comment.id,
    ),

    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => /* @__PURE__ */ new Date(),
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
      () => /* @__PURE__ */ new Date(),
    ),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),

    userId: text("user_id").references(() => user.id),
    userIp: text("user_ip"),
    userAgent: text("user_agent"),

    visitorName: text("visitor_name"),
    visitorEmail: text("visitor_email"),
    visitorWebsite: text("visitor_website"),

    anonymousName: text("anonymous_name"),

    isSpam: integer("is_spam", { mode: "boolean" }).notNull(),
  },
  (table) => [
    check(
      "either_id_or_visitor_name",
      sql`(${table.userId} IS NULL AND ${table.visitorName} IS NOT NULL) OR (${table.userId} IS NOT NULL AND ${table.visitorName} IS NULL)`,
    ),
    check(
      "no_visitor_email_or_website_if_no_name",
      sql`${table.visitorName} IS NOT NULL OR (${table.visitorEmail} IS NULL AND ${table.visitorWebsite} IS NULL)`,
    ),
  ],
);
