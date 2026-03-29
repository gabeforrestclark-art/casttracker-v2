CREATE TABLE `socialPost` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` varchar(128) NOT NULL,
	`caption` text NOT NULL,
	`platforms` varchar(256) NOT NULL,
	`status` enum('draft','queued','published','failed') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`ayrsharePostId` varchar(256),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialPost_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskNote` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` varchar(128) NOT NULL,
	`notes` text,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taskNote_id` PRIMARY KEY(`id`),
	CONSTRAINT `taskNote_taskId_unique` UNIQUE(`taskId`)
);
