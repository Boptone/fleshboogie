CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_type` varchar(64) NOT NULL,
	`metadata` text,
	`session_id` varchar(64),
	`ip_hash` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
