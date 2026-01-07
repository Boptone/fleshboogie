CREATE TABLE `rss_source_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source_url` text NOT NULL,
	`source_name` text NOT NULL,
	`category` varchar(64) NOT NULL,
	`is_enabled` int NOT NULL DEFAULT 1,
	`is_monitored` int NOT NULL DEFAULT 1,
	`total_fetches` int NOT NULL DEFAULT 0,
	`successful_fetches` int NOT NULL DEFAULT 0,
	`success_rate` int NOT NULL DEFAULT 100,
	`average_quality_score` int NOT NULL DEFAULT 0,
	`first_fetch_at` timestamp,
	`last_fetch_at` timestamp,
	`last_success_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rss_source_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rss_source_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source_url` text NOT NULL,
	`source_name` text NOT NULL,
	`last_fetch_at` timestamp NOT NULL,
	`fetch_success` int NOT NULL DEFAULT 1,
	`fetch_duration_ms` int,
	`fetch_error` text,
	`article_count` int NOT NULL DEFAULT 0,
	`music_article_count` int NOT NULL DEFAULT 0,
	`music_relevance_score` int NOT NULL DEFAULT 0,
	`average_article_age_hours` int,
	`articles_in_main_section` int NOT NULL DEFAULT 0,
	`articles_in_music_releases` int NOT NULL DEFAULT 0,
	`quality_score` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rss_source_metrics_id` PRIMARY KEY(`id`)
);
