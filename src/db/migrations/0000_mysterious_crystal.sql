CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`sdk_session_id` text,
	`type` text NOT NULL,
	`project_id` text,
	`started_at` text NOT NULL,
	`last_message_at` text,
	`message_count` integer DEFAULT 0,
	`context_summary` text
);
--> statement-breakpoint
CREATE INDEX `idx_conversations_sdk_session` ON `conversations` (`sdk_session_id`);--> statement-breakpoint
CREATE INDEX `idx_conversations_type` ON `conversations` (`type`);--> statement-breakpoint
CREATE INDEX `idx_conversations_last_message` ON `conversations` (`last_message_at`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`tool_calls` text,
	`tool_results` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_messages_conversation` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `idx_messages_conversation_created` ON `messages` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `session_index` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`type` text NOT NULL,
	`display_name` text NOT NULL,
	`last_active` text NOT NULL,
	`is_active` integer DEFAULT 1,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_session_index_last_active` ON `session_index` (`last_active`);--> statement-breakpoint
CREATE INDEX `idx_session_index_active` ON `session_index` (`is_active`,`last_active`);--> statement-breakpoint
CREATE INDEX `idx_session_index_type` ON `session_index` (`type`);