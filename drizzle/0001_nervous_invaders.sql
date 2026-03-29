CREATE TABLE `tripMedia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripNumber` int NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`fileName` varchar(256) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`fileSize` int NOT NULL,
	`caption` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripMedia_id` PRIMARY KEY(`id`)
);
