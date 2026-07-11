ALTER TABLE `comment` ADD `guest_owner_key` text;--> statement-breakpoint
CREATE INDEX `idx_comments_guest_owner` ON `comment` (`guest_owner_key`);