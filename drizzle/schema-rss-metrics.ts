import { pgTable, text, integer, timestamp, real, boolean } from 'drizzle-orm/pg-core';

/**
 * RSS Source Quality Metrics
 * Tracks performance and quality metrics for each RSS feed source
 */
export const rssSourceMetrics = pgTable('rss_source_metrics', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  
  // Source identification
  sourceUrl: text('source_url').notNull(),
  sourceName: text('source_name').notNull(),
  
  // Fetch metrics
  lastFetchAt: timestamp('last_fetch_at').notNull(),
  fetchSuccess: boolean('fetch_success').notNull().default(true),
  fetchDurationMs: integer('fetch_duration_ms'),
  fetchError: text('fetch_error'),
  
  // Content metrics
  articleCount: integer('article_count').notNull().default(0),
  musicArticleCount: integer('music_article_count').notNull().default(0),
  musicRelevanceScore: real('music_relevance_score').notNull().default(0), // 0-1
  
  // Quality metrics
  averageArticleAge: integer('average_article_age_hours'),
  articlesInMainSection: integer('articles_in_main_section').notNull().default(0),
  articlesInMusicReleases: integer('articles_in_music_releases').notNull().default(0),
  
  // Overall quality score (calculated)
  qualityScore: real('quality_score').notNull().default(0), // 0-100
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * RSS Source Configuration
 * Stores configuration and status for each RSS feed
 */
export const rssSourceConfig = pgTable('rss_source_config', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  
  sourceUrl: text('source_url').notNull().unique(),
  sourceName: text('source_name').notNull(),
  category: text('category').notNull(), // 'music', 'tech', 'entertainment', 'culture'
  
  // Status
  isEnabled: boolean('is_enabled').notNull().default(true),
  isMonitored: boolean('is_monitored').notNull().default(true),
  
  // Statistics (aggregated from metrics)
  totalFetches: integer('total_fetches').notNull().default(0),
  successfulFetches: integer('successful_fetches').notNull().default(0),
  successRate: real('success_rate').notNull().default(1.0), // 0-1
  averageQualityScore: real('average_quality_score').notNull().default(0), // 0-100
  
  // Timestamps
  firstFetchAt: timestamp('first_fetch_at'),
  lastFetchAt: timestamp('last_fetch_at'),
  lastSuccessAt: timestamp('last_success_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
