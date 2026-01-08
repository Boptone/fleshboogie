#!/usr/bin/env node
/**
 * RSS Feed Generator for FLESHBOOGIE
 * Generates RSS 2.0 and Atom feeds for AI search engine discoverability
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read content.json
const contentPath = path.join(__dirname, '../client/public/data/content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

const SITE_URL = 'https://fleshboogie.com';
const SITE_TITLE = 'FLESHBOOGIE';
const SITE_DESCRIPTION = 'Curated music and culture links from across the web. Updated 24/7 with the latest news, reviews, and discoveries in music, film, art, and underground culture.';
const SITE_LANGUAGE = 'en-us';
const SITE_COPYRIGHT = 'Copyright 2026 Fleshboogie. All content aggregated under Fair Use (17 U.S.C. § 107).';
const SITE_EDITOR = 'hello@fleshboogie.com (Fleshboogie Editorial)';

// Collect all articles
const allArticles = [];

// Add splash headline
if (content.splash && content.splash.headline && content.splash.url) {
  allArticles.push({
    title: content.splash.headline,
    url: content.splash.url,
    description: `Featured Story: ${content.splash.headline}`,
    category: 'Featured',
    pubDate: content.lastUpdated || new Date().toISOString()
  });
}

// Add main column stories
if (content.mainColumn && Array.isArray(content.mainColumn)) {
  content.mainColumn.forEach((item, index) => {
    if (item.title && item.url) {
      allArticles.push({
        title: item.title,
        url: item.url,
        description: item.title,
        category: 'Main Story',
        pubDate: content.lastUpdated || new Date().toISOString()
      });
    }
  });
}

// Add automated feed items (music news)
if (content.automated && Array.isArray(content.automated)) {
  content.automated.forEach((item) => {
    if (item.title && item.url) {
      allArticles.push({
        title: item.title,
        url: item.url,
        description: item.title,
        category: 'Music News',
        pubDate: content.lastUpdated || new Date().toISOString()
      });
    }
  });
}

// Add column 1 items
if (content.column1 && Array.isArray(content.column1)) {
  content.column1.forEach((item) => {
    if (item.title && item.url) {
      allArticles.push({
        title: item.title,
        url: item.url,
        description: item.title,
        category: 'Culture',
        pubDate: content.lastUpdated || new Date().toISOString()
      });
    }
  });
}

// Add column 2 items
if (content.column2 && Array.isArray(content.column2)) {
  content.column2.forEach((item) => {
    if (item.title && item.url) {
      allArticles.push({
        title: item.title,
        url: item.url,
        description: item.title,
        category: 'Film & TV',
        pubDate: content.lastUpdated || new Date().toISOString()
      });
    }
  });
}

// Add column 3 items
if (content.column3 && Array.isArray(content.column3)) {
  content.column3.forEach((item) => {
    if (item.title && item.url) {
      allArticles.push({
        title: item.title,
        url: item.url,
        description: item.title,
        category: 'Underground',
        pubDate: content.lastUpdated || new Date().toISOString()
      });
    }
  });
}

// Limit to 50 most recent articles
const recentArticles = allArticles.slice(0, 50);

// Helper to escape XML
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper to format RFC 822 date (for RSS)
function toRFC822(dateString) {
  const date = new Date(dateString);
  return date.toUTCString();
}

// Helper to format ISO 8601 date (for Atom)
function toISO8601(dateString) {
  const date = new Date(dateString);
  return date.toISOString();
}

// Generate RSS 2.0 feed
function generateRSS() {
  const buildDate = toRFC822(content.lastUpdated || new Date().toISOString());
  
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>${SITE_LANGUAGE}</language>
    <copyright>${escapeXml(SITE_COPYRIGHT)}</copyright>
    <managingEditor>${SITE_EDITOR}</managingEditor>
    <webMaster>${SITE_EDITOR}</webMaster>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/og-image.png</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>
`;

  recentArticles.forEach((article) => {
    rss += `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.url)}</link>
      <guid isPermaLink="false">${escapeXml(article.url)}</guid>
      <description>${escapeXml(article.description)}</description>
      <category>${escapeXml(article.category)}</category>
      <pubDate>${toRFC822(article.pubDate)}</pubDate>
      <dc:creator>Fleshboogie Editorial</dc:creator>
      <source url="${SITE_URL}">${escapeXml(SITE_TITLE)}</source>
    </item>`;
  });

  rss += `
  </channel>
</rss>`;

  return rss;
}

// Generate Atom feed
function generateAtom() {
  const updated = toISO8601(content.lastUpdated || new Date().toISOString());
  
  let atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_TITLE)}</title>
  <link href="${SITE_URL}" />
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <rights>${escapeXml(SITE_COPYRIGHT)}</rights>
  <author>
    <name>Fleshboogie Editorial</name>
    <email>hello@fleshboogie.com</email>
    <uri>${SITE_URL}</uri>
  </author>
  <icon>${SITE_URL}/og-image.png</icon>
  <logo>${SITE_URL}/og-image.png</logo>
`;

  recentArticles.forEach((article) => {
    atom += `
  <entry>
    <title>${escapeXml(article.title)}</title>
    <link href="${escapeXml(article.url)}" />
    <id>${escapeXml(article.url)}</id>
    <updated>${toISO8601(article.pubDate)}</updated>
    <summary>${escapeXml(article.description)}</summary>
    <category term="${escapeXml(article.category)}" />
    <author>
      <name>Fleshboogie Editorial</name>
    </author>
  </entry>`;
  });

  atom += `
</feed>`;

  return atom;
}

// Write feeds to public directory
const publicDir = path.join(__dirname, '../client/public');
const rssPath = path.join(publicDir, 'rss.xml');
const atomPath = path.join(publicDir, 'atom.xml');

try {
  const rssFeed = generateRSS();
  const atomFeed = generateAtom();
  
  fs.writeFileSync(rssPath, rssFeed, 'utf-8');
  fs.writeFileSync(atomPath, atomFeed, 'utf-8');
  
  console.log(`✅ RSS feed generated: ${recentArticles.length} articles`);
  console.log(`   - RSS 2.0: ${rssPath}`);
  console.log(`   - Atom: ${atomPath}`);
} catch (error) {
  console.error('❌ Error generating RSS feeds:', error);
  process.exit(1);
}
