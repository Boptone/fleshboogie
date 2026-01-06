#!/usr/bin/env node
/**
 * X (Twitter) Auto-Posting Script for FLESHBOOGIE
 * 
 * Posts top stories to X at optimal times throughout the day.
 * Requires X API v2 credentials (free tier: 1,500 posts/month).
 * 
 * Usage: node scripts/post-to-x.mjs
 * Schedule: Run every 3-4 hours via cron (6-8 posts/day)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// X API Configuration
const X_API_CONFIG = {
  apiKey: process.env.X_API_KEY || '',
  apiSecret: process.env.X_API_SECRET || '',
  accessToken: process.env.X_ACCESS_TOKEN || '',
  accessSecret: process.env.X_ACCESS_SECRET || '',
  bearerToken: process.env.X_BEARER_TOKEN || '',
};

// Posting Configuration
const POSTING_CONFIG = {
  maxTweetLength: 280,
  hashtagsDefault: ['#music', '#culture'],
  storiesPerPost: 1, // Post one story at a time
  prioritizeSplash: true, // Always prioritize splash headline
  includeTimestamp: false, // Don't include [HH:MM] in tweets
};

// Track posted stories to avoid duplicates
const POSTED_STORIES_FILE = path.join(__dirname, '../.posted-stories.json');

/**
 * Load content.json with current stories
 */
async function loadContent() {
  const contentPath = path.join(__dirname, '../client/public/data/content.json');
  const content = await fs.readFile(contentPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load previously posted stories to avoid duplicates
 */
async function loadPostedStories() {
  try {
    const data = await fs.readFile(POSTED_STORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty object
    return { urls: [], lastCleanup: Date.now() };
  }
}

/**
 * Save posted story URL to tracking file
 */
async function savePostedStory(url) {
  const posted = await loadPostedStories();
  
  // Add new URL
  posted.urls.push({
    url,
    timestamp: Date.now(),
  });
  
  // Clean up old entries (older than 7 days)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  posted.urls = posted.urls.filter(entry => entry.timestamp > sevenDaysAgo);
  posted.lastCleanup = Date.now();
  
  await fs.writeFile(POSTED_STORIES_FILE, JSON.stringify(posted, null, 2));
}

/**
 * Check if story has already been posted
 */
async function isAlreadyPosted(url) {
  const posted = await loadPostedStories();
  return posted.urls.some(entry => entry.url === url);
}

/**
 * Select best story to post
 * Priority: Splash headline (if not posted) > Most recent unposted story
 */
async function selectStoryToPost(content) {
  const allStories = [];
  
  // Add splash headline (highest priority)
  if (content.splash && content.splash.headline && content.splash.url) {
    allStories.push({
      title: content.splash.headline,
      url: content.splash.url,
      priority: 1,
      source: 'splash',
    });
  }
  
  // Add main column stories
  if (content.mainColumn) {
    content.mainColumn.forEach((story, index) => {
      if (story.title && story.url) {
        allStories.push({
          title: story.title,
          url: story.url,
          priority: 2,
          source: 'mainColumn',
          index,
        });
      }
    });
  }
  
  // Add automated stories
  if (content.automated) {
    content.automated.forEach((story, index) => {
      if (story.title && story.url) {
        allStories.push({
          title: story.title,
          url: story.url,
          priority: 3,
          source: 'automated',
          index,
        });
      }
    });
  }
  
  // Filter out already posted stories
  const unpostedStories = [];
  for (const story of allStories) {
    const posted = await isAlreadyPosted(story.url);
    if (!posted) {
      unpostedStories.push(story);
    }
  }
  
  if (unpostedStories.length === 0) {
    console.log('ℹ All stories have been posted. Waiting for new content...');
    return null;
  }
  
  // Sort by priority (1 = highest)
  unpostedStories.sort((a, b) => a.priority - b.priority);
  
  return unpostedStories[0];
}

/**
 * Format tweet text with headline, URL, and hashtags
 */
function formatTweet(story) {
  const { title, url } = story;
  const hashtags = POSTING_CONFIG.hashtagsDefault.join(' ');
  
  // Calculate available space for headline
  // Reserve space for: URL (23 chars on X) + space + hashtags + spaces
  const urlLength = 23; // X's t.co URL length
  const hashtagsLength = hashtags.length;
  const reservedSpace = urlLength + 1 + hashtagsLength + 1; // +1 for spaces
  const maxHeadlineLength = POSTING_CONFIG.maxTweetLength - reservedSpace;
  
  // Truncate headline if needed
  let headline = title;
  if (headline.length > maxHeadlineLength) {
    headline = headline.substring(0, maxHeadlineLength - 3) + '...';
  }
  
  // Format: [Headline] [URL] [hashtags]
  return `${headline} ${url} ${hashtags}`.trim();
}

/**
 * Post tweet to X using API v2
 */
async function postToX(tweetText) {
  const { apiKey, apiSecret, accessToken, accessSecret } = X_API_CONFIG;
  
  // Check if credentials are configured
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error('X API credentials not configured. Please set environment variables.');
  }
  
  // Use twitter-api-v2 package for posting
  // Note: This requires installing the package first
  try {
    const { TwitterApi } = await import('twitter-api-v2');
    
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });
    
    const rwClient = client.readWrite;
    const tweet = await rwClient.v2.tweet(tweetText);
    
    return tweet.data;
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('twitter-api-v2 package not installed. Run: npm install twitter-api-v2');
    }
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🐦 FLESHBOOGIE X Auto-Posting Script');
  console.log('=====================================\n');
  
  try {
    // Load content
    console.log('📖 Loading content...');
    const content = await loadContent();
    
    // Select story to post
    console.log('🎯 Selecting story to post...');
    const story = await selectStoryToPost(content);
    
    if (!story) {
      console.log('✓ No new stories to post at this time.');
      return;
    }
    
    console.log(`✓ Selected: "${story.title.substring(0, 60)}..."`);
    console.log(`  Source: ${story.source}`);
    console.log(`  URL: ${story.url}\n`);
    
    // Format tweet
    const tweetText = formatTweet(story);
    console.log('📝 Tweet preview:');
    console.log('─────────────────────────────────────');
    console.log(tweetText);
    console.log('─────────────────────────────────────');
    console.log(`Length: ${tweetText.length}/280 characters\n`);
    
    // Check if running in dry-run mode (no credentials)
    const { apiKey, apiSecret, accessToken, accessSecret } = X_API_CONFIG;
    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      console.log('⚠️  DRY RUN MODE (no X API credentials configured)');
      console.log('ℹ  Tweet formatted successfully but not posted.');
      console.log('ℹ  Add X API credentials to .env to enable posting.\n');
      return;
    }
    
    // Post to X
    console.log('🚀 Posting to X...');
    const result = await postToX(tweetText);
    console.log(`✓ Posted successfully! Tweet ID: ${result.id}\n`);
    
    // Save to posted stories
    await savePostedStory(story.url);
    console.log('✓ Marked story as posted.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('API Error Details:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

main();
