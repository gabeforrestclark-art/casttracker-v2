CREATE TABLE `automationLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(64) NOT NULL,
	`status` enum('success','skipped','error') NOT NULL DEFAULT 'success',
	`summary` text,
	`runAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automationLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripCatch` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripNumber` int NOT NULL,
	`fishCaught` int NOT NULL DEFAULT 0,
	`speciesJson` text,
	`waterTemp` varchar(32),
	`weatherSummary` varchar(128),
	`windMph` int,
	`baitUsed` text,
	`launchTime` varchar(32),
	`hoursOnWater` varchar(32),
	`gpsLat` varchar(32),
	`gpsLng` varchar(32),
	`personalNotes` text,
	`generatedCaption` text,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tripCatch_id` PRIMARY KEY(`id`),
	CONSTRAINT `tripCatch_tripNumber_unique` UNIQUE(`tripNumber`)
);
