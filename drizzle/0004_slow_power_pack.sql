CREATE TABLE `featured_artist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artist_name` text NOT NULL,
	`musicbrainz_id` varchar(64),
	`bio` text,
	`genres` text,
	`origin_country` varchar(64),
	`origin_city` varchar(128),
	`formed_year` int,
	`links` text,
	`latest_releases` text,
	`curator_notes` text,
	`is_active` int NOT NULL DEFAULT 1,
	`featured_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featured_artist_id` PRIMARY KEY(`id`)
);
