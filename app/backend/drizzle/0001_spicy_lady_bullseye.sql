CREATE TABLE `reaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comment_id` integer NOT NULL,
	`actor_id` text,
	`actor_anon_key` text,
	`emoji_raw` text NOT NULL,
	`emoji_key` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "either_actor_id_or_actor_anon_key" CHECK(("reaction"."actor_id" IS NULL AND "reaction"."actor_anon_key" IS NOT NULL) OR ("reaction"."actor_id" IS NOT NULL AND "reaction"."actor_anon_key" IS NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_reaction` ON `reaction` (`comment_id`,`emoji_key`,`actor_id`) WHERE "reaction"."actor_id" IS NOT NULL AND "reaction"."actor_anon_key" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_anon_reaction` ON `reaction` (`comment_id`,`emoji_key`,`actor_anon_key`) WHERE "reaction"."actor_id" IS NULL AND "reaction"."actor_anon_key" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_reactions_comment_emoji` ON `reaction` (`comment_id`,`emoji_key`);