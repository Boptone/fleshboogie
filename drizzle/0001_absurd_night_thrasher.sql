CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'America/New_York',
	`is_active` int NOT NULL DEFAULT 1,
	`subscribed_at` timestamp NOT NULL DEFAULT (now()),
	`last_email_sent` timestamp,
	`unsubscribe_token` varchar(64) NOT NULL,
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`),
	CONSTRAINT `newsletter_subscribers_unsubscribe_token_unique` UNIQUE(`unsubscribe_token`)
);
