import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Newsletter subscribers table for "The Boogie Blast" daily email
 * Stores email addresses and timezone preferences for automated delivery
 */
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  timezone: varchar("timezone", { length: 64 }).notNull().default("America/New_York"),
  frequency: mysqlEnum("frequency", ["daily", "weekly"]).default("daily").notNull(),
  isActive: int("is_active").notNull().default(1),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  lastEmailSent: timestamp("last_email_sent"),
  unsubscribeToken: varchar("unsubscribe_token", { length: 64 }).notNull().unique(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * RSS Source Quality Metrics
 * Tracks performance and quality metrics for each RSS feed source
 */
export const rssSourceMetrics = mysqlTable("rss_source_metrics", {
  id: int("id").autoincrement().primaryKey(),
  
  // Source identification
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  
  // Fetch metrics
  lastFetchAt: timestamp("last_fetch_at").notNull(),
  fetchSuccess: int("fetch_success").notNull().default(1), // 1=true, 0=false
  fetchDurationMs: int("fetch_duration_ms"),
  fetchError: text("fetch_error"),
  
  // Content metrics
  articleCount: int("article_count").notNull().default(0),
  musicArticleCount: int("music_article_count").notNull().default(0),
  musicRelevanceScore: int("music_relevance_score").notNull().default(0), // 0-100 (percentage)
  
  // Quality metrics
  averageArticleAge: int("average_article_age_hours"),
  articlesInMainSection: int("articles_in_main_section").notNull().default(0),
  articlesInMusicReleases: int("articles_in_music_releases").notNull().default(0),
  
  // Overall quality score (calculated)
  qualityScore: int("quality_score").notNull().default(0), // 0-100
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RssSourceMetric = typeof rssSourceMetrics.$inferSelect;
export type InsertRssSourceMetric = typeof rssSourceMetrics.$inferInsert;

/**
 * RSS Source Configuration
 * Stores configuration and status for each RSS feed
 */
export const rssSourceConfig = mysqlTable("rss_source_config", {
  id: int("id").autoincrement().primaryKey(),
  
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  category: varchar("category", { length: 64 }).notNull(), // 'music', 'tech', 'entertainment', 'culture'
  
  // Status
  isEnabled: int("is_enabled").notNull().default(1), // 1=true, 0=false
  isMonitored: int("is_monitored").notNull().default(1),
  
  // Statistics (aggregated from metrics)
  totalFetches: int("total_fetches").notNull().default(0),
  successfulFetches: int("successful_fetches").notNull().default(0),
  successRate: int("success_rate").notNull().default(100), // 0-100 percentage
  averageQualityScore: int("average_quality_score").notNull().default(0), // 0-100
  
  // Timestamps
  firstFetchAt: timestamp("first_fetch_at"),
  lastFetchAt: timestamp("last_fetch_at"),
  lastSuccessAt: timestamp("last_success_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RssSourceConfig = typeof rssSourceConfig.$inferSelect;
export type InsertRssSourceConfig = typeof rssSourceConfig.$inferInsert;

/**
 * Featured Artist Spotlight
 * Stores the currently featured artist with auto-populated data from MusicBrainz
 */
export const featuredArtist = mysqlTable("featured_artist", {
  id: int("id").autoincrement().primaryKey(),
  
  // Artist identification
  artistName: text("artist_name").notNull(),
  musicbrainzId: varchar("musicbrainz_id", { length: 64 }),
  
  // Auto-populated data from MusicBrainz
  bio: text("bio"),
  genres: text("genres"), // JSON array of genre strings
  originCountry: varchar("origin_country", { length: 64 }),
  originCity: varchar("origin_city", { length: 128 }),
  formedYear: int("formed_year"),
  
  // Links (JSON object with keys: website, bandcamp, spotify, soundcloud, instagram, twitter)
  links: text("links"),
  
  // Latest releases (JSON array of release objects)
  latestReleases: text("latest_releases"),
  
  // Custom curator notes
  curatorNotes: text("curator_notes"),
  
  // Status
  isActive: int("is_active").notNull().default(1), // Only one can be active at a time
  
  // Timestamps
  featuredAt: timestamp("featured_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FeaturedArtist = typeof featuredArtist.$inferSelect;
export type InsertFeaturedArtist = typeof featuredArtist.$inferInsert;