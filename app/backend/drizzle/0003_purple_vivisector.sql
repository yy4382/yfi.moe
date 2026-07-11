PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__reaction_backup` AS SELECT * FROM `reaction`;--> statement-breakpoint
CREATE TABLE `__new_comment` (
	`id` integer PRIMARY KEY NOT NULL,
	`raw_content` text NOT NULL,
	`rendered_content` text NOT NULL,
	`path` text NOT NULL,
	`parent_id` integer,
	`reply_to_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`user_id` text,
	`user_ip` text,
	`user_agent` text,
	`visitor_name` text,
	`visitor_email` text,
	`guest_owner_key` text,
	`anonymous_name` text,
	`is_spam` integer NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reply_to_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "either_id_or_visitor_name" CHECK(("__new_comment"."user_id" IS NULL AND "__new_comment"."visitor_name" IS NOT NULL) OR ("__new_comment"."user_id" IS NOT NULL AND "__new_comment"."visitor_name" IS NULL)),
	CONSTRAINT "no_visitor_email_if_no_name" CHECK("__new_comment"."visitor_name" IS NOT NULL OR ("__new_comment"."visitor_email" IS NULL)),
	CONSTRAINT "not_both_user_and_guest_owner" CHECK("__new_comment"."user_id" IS NULL OR "__new_comment"."guest_owner_key" IS NULL)
);
--> statement-breakpoint
INSERT INTO `__new_comment`("id", "raw_content", "rendered_content", "path", "parent_id", "reply_to_id", "created_at", "updated_at", "deleted_at", "user_id", "user_ip", "user_agent", "visitor_name", "visitor_email", "guest_owner_key", "anonymous_name", "is_spam") SELECT "id", "raw_content", "rendered_content", "path", "parent_id", "reply_to_id", "created_at", "updated_at", "deleted_at", "user_id", "user_ip", "user_agent", "visitor_name", "visitor_email", "guest_owner_key", "anonymous_name", "is_spam" FROM `comment`;--> statement-breakpoint
DROP TABLE `comment`;--> statement-breakpoint
ALTER TABLE `__new_comment` RENAME TO `comment`;--> statement-breakpoint
INSERT OR IGNORE INTO `reaction` (`id`, `comment_id`, `actor_id`, `actor_anon_key`, `emoji_raw`, `emoji_key`, `created_at`) SELECT `id`, `comment_id`, `actor_id`, `actor_anon_key`, `emoji_raw`, `emoji_key`, `created_at` FROM `__reaction_backup`;--> statement-breakpoint
DROP TABLE `__reaction_backup`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_comments_guest_owner` ON `comment` (`guest_owner_key`);
