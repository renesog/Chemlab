CREATE TABLE `live_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`snapshot` text NOT NULL,
	`teacher_token` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `live_rooms_code_unique` ON `live_rooms` (`code`);--> statement-breakpoint
CREATE TABLE `live_student_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`student_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `live_rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
