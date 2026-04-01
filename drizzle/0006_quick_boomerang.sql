CREATE TABLE `socialAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(50) NOT NULL,
	`handle` varchar(100) NOT NULL DEFAULT '',
	`followers` int NOT NULL DEFAULT 0,
	`views` int NOT NULL DEFAULT 0,
	`posts` int NOT NULL DEFAULT 0,
	`profileUrl` varchar(255) NOT NULL DEFAULT '',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialAccounts_platform_unique` UNIQUE(`platform`)
);
