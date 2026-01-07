#!/usr/bin/env node
/**
 * RSS Metrics Tracking Module
 * Provides functions to track and store RSS source quality metrics
 */

import { createConnection } from 'mysql2/promise';

// Database connection
let db = null;

async function getDb() {
  if (!db) {
    db = await createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return db;
}

/**
 * Initialize RSS source configuration
 * Creates config entries for all sources if they don't exist
 */
export async function initializeSourceConfigs(sources) {
  const connection = await getDb();
  
  for (const source of sources) {
    const [existing] = await connection.execute(
      'SELECT id FROM rss_source_config WHERE source_url = ?',
      [source.url]
    );
    
    if (existing.length === 0) {
      await connection.execute(
        `INSERT INTO rss_source_config 
        (source_url, source_name, category, is_enabled, is_monitored) 
        VALUES (?, ?, ?, 1, 1)`,
        [source.url, source.name || 'Unknown', source.category || 'general']
      );
      console.log(`✓ Initialized config for: ${source.name}`);
    }
  }
}

/**
 * Record metrics for a single RSS source fetch
 */
export async function recordSourceMetrics(metrics) {
  const connection = await getDb();
  
  const {
    sourceUrl,
    sourceName,
    fetchSuccess,
    fetchDurationMs,
    fetchError,
    articleCount,
    musicArticleCount,
    averageArticleAge,
    articlesInMainSection,
    articlesInMusicReleases,
  } = metrics;
  
  // Calculate music relevance score (0-100)
  const musicRelevanceScore = articleCount > 0 
    ? Math.round((musicArticleCount / articleCount) * 100) 
    : 0;
  
  // Calculate quality score (0-100)
  // Factors: success (40%), music relevance (30%), freshness (15%), engagement (15%)
  let qualityScore = 0;
  if (fetchSuccess) qualityScore += 40;
  qualityScore += musicRelevanceScore * 0.3;
  if (averageArticleAge && averageArticleAge < 24) qualityScore += 15; // Fresh content bonus
  if (articlesInMainSection > 0 || articlesInMusicReleases > 0) qualityScore += 15; // Engagement bonus
  qualityScore = Math.round(qualityScore);
  
  // Insert metrics record
  await connection.execute(
    `INSERT INTO rss_source_metrics 
    (source_url, source_name, last_fetch_at, fetch_success, fetch_duration_ms, fetch_error,
     article_count, music_article_count, music_relevance_score, average_article_age_hours,
     articles_in_main_section, articles_in_music_releases, quality_score)
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sourceUrl,
      sourceName,
      fetchSuccess ? 1 : 0,
      fetchDurationMs,
      fetchError,
      articleCount,
      musicArticleCount,
      musicRelevanceScore,
      averageArticleAge,
      articlesInMainSection,
      articlesInMusicReleases,
      qualityScore,
    ]
  );
  
  // Update source config statistics
  await updateSourceConfig(sourceUrl, fetchSuccess, qualityScore);
}

/**
 * Update aggregated statistics in source config
 */
async function updateSourceConfig(sourceUrl, fetchSuccess, qualityScore) {
  const connection = await getDb();
  
  // Get current stats
  const [config] = await connection.execute(
    'SELECT total_fetches, successful_fetches, average_quality_score FROM rss_source_config WHERE source_url = ?',
    [sourceUrl]
  );
  
  if (config.length === 0) return;
  
  const totalFetches = config[0].total_fetches + 1;
  const successfulFetches = config[0].successful_fetches + (fetchSuccess ? 1 : 0);
  const successRate = Math.round((successfulFetches / totalFetches) * 100);
  
  // Calculate rolling average quality score
  const currentAvg = config[0].average_quality_score;
  const newAvg = Math.round((currentAvg * config[0].total_fetches + qualityScore) / totalFetches);
  
  // Update config
  await connection.execute(
    `UPDATE rss_source_config 
    SET total_fetches = ?, 
        successful_fetches = ?, 
        success_rate = ?,
        average_quality_score = ?,
        last_fetch_at = NOW(),
        ${fetchSuccess ? 'last_success_at = NOW(),' : ''}
        ${config[0].first_fetch_at ? '' : 'first_fetch_at = NOW(),'}
        updated_at = NOW()
    WHERE source_url = ?`,
    [totalFetches, successfulFetches, successRate, newAvg, sourceUrl]
  );
}

/**
 * Get quality report for all sources
 */
export async function getQualityReport() {
  const connection = await getDb();
  
  const [sources] = await connection.execute(
    `SELECT 
      source_name,
      source_url,
      category,
      is_enabled,
      total_fetches,
      success_rate,
      average_quality_score,
      last_fetch_at,
      last_success_at
    FROM rss_source_config
    ORDER BY average_quality_score DESC, success_rate DESC`
  );
  
  return sources;
}

/**
 * Get detailed metrics for a specific source
 */
export async function getSourceMetrics(sourceUrl, limit = 10) {
  const connection = await getDb();
  
  const [metrics] = await connection.execute(
    `SELECT * FROM rss_source_metrics 
    WHERE source_url = ? 
    ORDER BY last_fetch_at DESC 
    LIMIT ?`,
    [sourceUrl, limit]
  );
  
  return metrics;
}

/**
 * Disable low-quality sources automatically
 */
export async function disableLowQualitySources(threshold = 30) {
  const connection = await getDb();
  
  const [result] = await connection.execute(
    `UPDATE rss_source_config 
    SET is_enabled = 0, updated_at = NOW()
    WHERE average_quality_score < ? 
      AND total_fetches >= 5
      AND is_enabled = 1`,
    [threshold]
  );
  
  return result.affectedRows;
}

/**
 * Close database connection
 */
export async function closeDb() {
  if (db) {
    await db.end();
    db = null;
  }
}
