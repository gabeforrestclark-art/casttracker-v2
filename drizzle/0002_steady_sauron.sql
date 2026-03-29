CREATE TABLE `tripPlan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripNumber` int NOT NULL,
	`goNoGo` enum('go','no-go','undecided') NOT NULL DEFAULT 'undecided',
	`prepNotes` text,
	`checklistJson` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tripPlan_id` PRIMARY KEY(`id`),
	CONSTRAINT `tripPlan_tripNumber_unique` UNIQUE(`tripNumber`)
);
