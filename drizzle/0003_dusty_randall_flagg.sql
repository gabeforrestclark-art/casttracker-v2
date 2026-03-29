CREATE TABLE `roadmapTask` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` varchar(128) NOT NULL,
	`checked` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roadmapTask_id` PRIMARY KEY(`id`),
	CONSTRAINT `roadmapTask_taskId_unique` UNIQUE(`taskId`)
);
