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

/**
 * Update sitemap.xml with current timestamp
 * Called automatically when RSS fetcher updates content
 */
function updateSitemap() {
  const sitemapPath = path.join(__dirname, '..', 'client', 'public', 'sitemap.xml');
  const now = new Date().toISOString();
  
  try {
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    
    // Update homepage and archive lastmod (these change with every RSS update)
    sitemap = sitemap.replace(
      /(<loc>https:\/\/fleshboogie\.com\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
      `$1${now}$2`
    );
    sitemap = sitemap.replace(
      /(<loc>https:\/\/fleshboogie\.com\/archive<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
      `$1${now}$2`
    );
    
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('✓ Updated sitemap.xml with current timestamp');
  } catch (err) {
    console.error('✗ Failed to update sitemap:', err.message);
  }
}

// RSS Feeds to monitor (curated for independent music and culture)
// Focused on underground, indie, electronic, and substantive music journalism
// Excludes mainstream pop and celebrity gossip sources
const FEEDS = [
  // Core independent music sources
  'https://consequenceofsound.net/feed/',      // Broad indie coverage
  'https://www.thequietus.com/feed',           // Avant-garde, experimental
  'https://pitchfork.com/rss/news/',           // Music news
  'https://www.brooklynvegan.com/feed/',       // Indie, punk, underground
  'https://www.factmag.com/feed/',             // Electronic, club culture
  
  // Niche underground blogs
  'https://www.tinymixtapes.com/feed.xml',     // Experimental, avant-garde
  'https://www.gorillavsbear.net/feed/',       // Indie, electronic, dream pop
  'https://www.passionweiss.com/feed/',        // Hip-hop, rap, underground
  'https://www.stereofox.com/feed/',           // Chillhop, indie electronic
  'https://www.dummymag.com/feed/',            // Electronic, experimental
  
  // Additional music and culture sources
  'https://www.clashmusic.com/feed',           // UK music magazine
  'https://www.nme.com/feed',                  // Music news and culture
  'https://www.juxtapoz.com/feed',             // Art and culture
  'https://www.musicbusinessworldwide.com/feed', // Music industry news
  'https://www.rollingstone.com/feed/',        // Music news
  'https://www.goldminemag.com/feed',          // Record collecting and reissues
  'https://www.udiscovermusic.com/feed',       // Music history and discovery
  
  // Entertainment and tech sources
  'https://deadline.com/feed/',                // Entertainment news
  'https://www.hollywoodreporter.com/feed/',   // Entertainment industry
  'https://www.indiewire.com/feed/',           // Independent film and TV
  'https://variety.com/feed/',                 // Entertainment news
  'https://www.theguardian.com/music/rss',     // Guardian music section
  'https://techcrunch.com/feed/',              // Tech and startups
];

// Keywords to filter out mainstream pop, gossip, politics, business, and Trump content
const EXCLUDE_KEYWORDS = [
  // Mainstream pop
  'taylor swift',
  'beyonce',
  'drake',
  'kardashian',
  'ariana grande',
  'justin bieber',
  'grammy',
  'billboard hot 100',
  'top 40',
  
  // Celebrity gossip
  'dating',
  'breakup',
  'engaged',
  'married',
  'divorce',
  'pregnant',
  'baby',
  
  // Politics and Trump (strict filtering)
  'trump',
  'donald trump',
  'president trump',
  'maga',
  'republican',
  'democrat',
  'biden',
  'election',
  'political',
  'politics',
  'congress',
  'senate',
  'white house',
  'capitol',
  
  // Corporate business and stocks
  'stock market',
  'stocks',
  'nasdaq',
  'dow jones',
  'wall street',
  's&p 500',
  'shares',
  'earnings report',
  'quarterly earnings',
  'ipo',
  'merger',
  'acquisition',
  'corporate',
  
  // Crime, violence, and murder
  'murder',
  'killed',
  'shooting',
  'shot dead',
  'stabbing',
  'assault',
  'attack',
  'violence',
  'violent',
  'crime',
  'criminal',
  'police',
  'arrest',
  'charged',
  'trial',
  'lawsuit',
  'guilty',
  'convicted',
  'sentence',
  'prison',
  'jail',
  
  // Tragedy and disaster
  'death',
  'died',
  'dead',
  'fatal',
  'tragedy',
  'tragic',
  'disaster',
  'crash',
  'accident',
  'fire',
  'explosion',
  'victim',
  'injured',
  'wounded',
  
  // War and conflict
  'war',
  'military',
  'soldier',
  'battle',
  'conflict',
  'invasion',
  'bombing',
  'missile',
  'ukraine',
  'russia',
  'israel',
  'palestine',
  'gaza',
  
  // Controversy and scandal
  'scandal',
  'controversy',
  'allegations',
  'accused',
  'abuse',
  'harassment',
  'investigation',
  'probe',
  'fraud',
  'scam',
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
  
  // Auto-populate splash headline with top story if empty or placeholder
  if (!content.splash.headline || content.splash.url.includes('example.com') || content.splash.url.endsWith('.com') || content.splash.url.endsWith('.com/')) {
    if (recentItems.length > 0) {
      content.splash = {
        headline: recentItems[0].title.toUpperCase(),
        url: recentItems[0].url,
        image: ''
      };
    }
  }
  
  // Auto-populate main column with top 5 stories if empty or has placeholders
  const hasPlaceholders = content.mainColumn.some(item => 
    item.url.includes('example.com') || item.url.endsWith('.com') || item.url.endsWith('.com/')
  );
  
  if (content.mainColumn.length === 0 || hasPlaceholders) {
    content.mainColumn = recentItems.slice(1, 6).map(item => ({
      title: item.title,
      url: item.url,
      timestamp: item.timestamp
    }));
  }
  
  // Auto-populate three columns with articles from the feed if they have placeholders
  const column1HasPlaceholders = content.column1.some(item => 
    item.url.includes('example.com') || item.url.endsWith('.com') || item.url.endsWith('.com/')
  );
  const column2HasPlaceholders = content.column2.some(item => 
    item.url.includes('example.com') || item.url.endsWith('.com') || item.url.endsWith('.com/')
  );
  const column3HasPlaceholders = content.column3.some(item => 
    item.url.includes('example.com') || item.url.endsWith('.com') || item.url.endsWith('.com/')
  );
  
  if (content.column1.length === 0 || column1HasPlaceholders) {
    content.column1 = recentItems.slice(6, 11).map(item => ({
      title: item.title,
      url: item.url
    }));
  }
  
  if (content.column2.length === 0 || column2HasPlaceholders) {
    content.column2 = recentItems.slice(11, 16).map(item => ({
      title: item.title,
      url: item.url
    }));
  }
  
  if (content.column3.length === 0 || column3HasPlaceholders) {
    content.column3 = recentItems.slice(16, 21).map(item => ({
      title: item.title,
      url: item.url
    }));
  }
  
  // Update automated section with remaining items
  content.automated = recentItems;
  content.lastUpdated = new Date().toISOString();
  
  // Write back to file
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
  
  console.log(`\n✓ Updated content.json with ${recentItems.length} automated links`);
  console.log(`Last updated: ${content.lastUpdated}`);
  
  // Update sitemap with current timestamp
  updateSitemap();
  
  // Update archive with splash headline
  const archivePath = path.join(__dirname, '..', 'client', 'public', 'data', 'archive.json');
  let archive = { items: [], lastUpdated: new Date().toISOString() };
  
  try {
    if (fs.existsSync(archivePath)) {
      archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
    }
  } catch (err) {
    console.log('Creating new archive.json');
  }
  
  // Add current splash headline to archive if it's not already there
  if (content.splash.headline && content.splash.url) {
    const exists = archive.items.some(item => item.url === content.splash.url);
    if (!exists) {
      archive.items.unshift({
        headline: content.splash.headline,
        url: content.splash.url,
        date: new Date().toISOString()
      });
      
      // Keep only last 30 days of headlines
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      archive.items = archive.items.filter(item => new Date(item.date) > thirtyDaysAgo);
      
      archive.lastUpdated = new Date().toISOString();
      fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
      console.log(`✓ Updated archive with ${archive.items.length} historical headlines`);
    }
  }
}

main().catch(console.error);
