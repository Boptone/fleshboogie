#!/usr/bin/env node

/**
 * RSS Feed Fetcher for Fleshboogie
 * 
 * This script fetches the latest headlines from curated RSS feeds
 * and updates the content.json file with fresh links.
 * 
 * Designed to run via GitHub Actions every hour for 24/7 updates.
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// RSS Feeds to monitor (curated for independent music and culture)
// Focused on underground, indie, electronic, and substantive music journalism
// Excludes mainstream pop and celebrity gossip sources
const FEEDS = [
  'https://consequenceofsound.net/feed/',      // Broad indie coverage
  'https://www.thequietus.com/feed',           // Avant-garde, experimental
  'https://pitchfork.com/rss/news/',           // Music news
  'https://www.brooklynvegan.com/feed/',       // Indie, punk, underground
  'https://www.factmag.com/feed/',             // Electronic, club culture
];

// Keywords to filter out mainstream pop and gossip content
const EXCLUDE_KEYWORDS = [
  'taylor swift',
  'beyonce',
  'drake',
  'kardashian',
  'ariana grande',
  'justin bieber',
  'grammy',
  'billboard hot 100',
  'top 40',
  'dating',
  'breakup',
  'engaged',
  'married',
  'divorce',
  'pregnant',
  'baby',
];

// Filter function to exclude mainstream/gossip content
function shouldIncludeItem(title) {
  const lowerTitle = title.toLowerCase();
  
  // Check if title contains any excluded keywords
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (lowerTitle.includes(keyword)) {
      return false;
    }
  }
  
  return true;
}

// Simple RSS parser (no dependencies)
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/s.exec(itemXml);
    const linkMatch = /<link>(.*?)<\/link>/s.exec(itemXml);
    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/s.exec(itemXml);
    
    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const url = linkMatch[1].trim();
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
      
      items.push({
        title: title.replace(/<[^>]*>/g, ''), // Strip any HTML tags
        url,
        timestamp: pubDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        pubDate,
      });
    }
  }

  return items;
}

// Fetch RSS feed with redirect handling
function fetchFeed(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }
    
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        if (res.headers.location) {
          return fetchFeed(res.headers.location, redirectCount + 1)
            .then(resolve)
            .catch(reject);
        }
      }
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Main function
async function main() {
  console.log('🎵 Fetching latest music and culture news...\n');
  
  const allItems = [];
  
  for (const feedUrl of FEEDS) {
    try {
      console.log(`Fetching: ${feedUrl}`);
      const xml = await fetchFeed(feedUrl);
      const items = parseRSS(xml);
      allItems.push(...items);
      console.log(`✓ Found ${items.length} items\n`);
    } catch (error) {
      console.error(`✗ Failed to fetch ${feedUrl}: ${error.message}\n`);
    }
  }
  
  // Filter out mainstream pop and gossip content
  const filteredItems = allItems.filter(item => shouldIncludeItem(item.title));
  
  console.log(`\n🎯 Filtered out ${allItems.length - filteredItems.length} mainstream/gossip items`);
  
  // Sort by publication date (newest first)
  filteredItems.sort((a, b) => b.pubDate - a.pubDate);
  
  // Take top 20 most recent items
  const recentItems = filteredItems.slice(0, 20).map(item => ({
    title: item.title,
    url: item.url,
    timestamp: item.timestamp,
  }));
  
  console.log(`\n📰 Total items collected: ${recentItems.length}`);
  
  // Load existing content
  const contentPath = path.join(__dirname, '../client/public/data/content.json');
  let content;
  
  try {
    const contentData = fs.readFileSync(contentPath, 'utf8');
    content = JSON.parse(contentData);
  } catch (error) {
    console.error('Failed to read content.json, using default structure');
    content = {
      splash: { headline: '', url: '', image: '' },
      mainColumn: [],
      column1: [],
      column2: [],
      column3: [],
      automated: [],
    };
  }
  
  // Update automated section
  content.automated = recentItems;
  content.lastUpdated = new Date().toISOString();
  
  // Write back to file
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
  
  console.log(`\n✓ Updated content.json with ${recentItems.length} automated links`);
  console.log(`Last updated: ${content.lastUpdated}`);
}

main().catch(console.error);
