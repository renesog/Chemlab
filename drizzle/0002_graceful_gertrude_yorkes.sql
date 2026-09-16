CREATE TABLE `live_room_answer_keys` (
	`room_id` text PRIMARY KEY NOT NULL,
	`answers_json` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `live_rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teacher_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`avatar` text DEFAULT 'flask' NOT NULL,
	`color` text DEFAULT 'cyan' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `live_rooms` ADD `owner_user_id` text;