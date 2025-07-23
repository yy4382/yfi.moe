import { sql } from "drizzle-orm";
import { serial, timestamp } from "drizzle-orm/pg-core";
import {
  check,
  integer,
  pgTable,
  text,
  boolean,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // `admin` plugin fields
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // `admin` plugin fields
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const comment = pgTable(
  "comment",
  {
    id: serial("id").primaryKey(),

    rawContent: text("raw_content").notNull(),
    renderedContent: text("rendered_content").notNull(),

    path: text("path").notNull(),
    parentId: integer("parent_id").references((): AnyPgColumn => comment.id),
    replyToId: integer("reply_to_id").references((): AnyPgColumn => comment.id),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),

    userId: text("user_id").references(() => user.id),
    userIp: text("user_ip"),
    userAgent: text("user_agent"),

    visitorName: text("visitor_name"),
    visitorEmail: text("visitor_email"),

    anonymousName: text("anonymous_name"),

    isSpam: boolean("is_spam").notNull(),
  },
  (table) => [
    check(
      "either_id_or_visitor_name",
      sql`(${table.userId} IS NULL AND ${table.visitorName} IS NOT NULL) OR (${table.userId} IS NOT NULL AND ${table.visitorName} IS NULL)`,
    ),
    check(
      "no_visitor_email_if_no_name",
      sql`${table.visitorName} IS NOT NULL OR (${table.visitorEmail} IS NULL)`,
    ),
  ],
);
