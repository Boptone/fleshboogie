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
 * Write collected items to content.json
 * Can be called incrementally during fetch or at the end
 */
function writeContent(allItems, contentPath) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Filter out mainstream pop and gossip content
  const filteredItems = allItems.filter(item => shouldIncludeItem(item.title));
  
  // Sort by publication date (newest first)
  filteredItems.sort((a, b) => b.pubDate - a.pubDate);
  
  // Identify music releases
  const musicReleases = filteredItems.filter(item => {
    const titleLower = item.title.toLowerCase();
    const nonMusicKeywords = ['season', 'episode', 'tv', 'show', 'series', 'movie', 'film', 'ceo', 'streamer', 'roku', 'netflix', 'hbo', 'hulu', 'amazon prime', 'apple tv', 'disney+', 'game', 'gaming'];
    const mainstreamArtists = ['bruno mars', 'taylor swift', 'beyonce', 'drake', 'ed sheeran', 'ariana grande', 'justin bieber', 'billie eilish', 'the weeknd', 'dua lipa', 'olivia rodrigo', 'bad bunny', 'harry styles', 'adele', 'rihanna', 'kanye west', 'post malone', 'lady gaga', 'katy perry', 'miley cyrus', 'selena gomez', 'shawn mendes', 'camila cabello', 'doja cat', 'megan thee stallion', 'cardi b', 'lizzo', 'sam smith', 'charlie puth', 'bts', 'blackpink', 'amy grant', 'christian', 'gospel', 'worship', 'praise', 'hillsong', 'bethel music', 'elevation worship', 'jesus', 'christ', 'faith-based'];
    
    if (mainstreamArtists.some(artist => titleLower.includes(artist))) return false;
    if (nonMusicKeywords.some(keyword => titleLower.includes(keyword))) return false;
    
    const releaseKeywords = ['album', 'ep', 'single', 'track', 'release', 'debut', 'drops', 'out now', 'new music', 'shares', 'announces album', 'announces ep'];
    const hasReleaseKeyword = releaseKeywords.some(keyword => titleLower.includes(keyword));
    
    const musicContextKeywords = ['artist', 'band', 'musician', 'singer', 'rapper', 'producer', 'dj', 'label', 'record', 'song', 'listen'];
    const hasMusicContext = musicContextKeywords.some(keyword => titleLower.includes(keyword));
    
    return hasReleaseKeyword && hasMusicContext;
  }).slice(0, 20);
  
  const recentItems = filteredItems.slice(0, 40);
  
  // Read existing content
  let content = { splash: {}, mainColumn: [], column1: [], column2: [], column3: [], automated: [], musicReleases: [] };
  try {
    if (fs.existsSync(contentPath)) {
      content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    }
  } catch (err) {
    console.log('Creating new content.json');
  }
  
  // Auto-rotate splash headline
  if (!content.splash.pinned && recentItems.length > 0) {
    content.splash = {
      headline: recentItems[0].title.toUpperCase(),
      url: recentItems[0].url,
      image: '',
      pinned: false
    };
  }
  
  // Auto-rotate main column
  const pinnedMain = content.mainColumn?.filter(item => item.pinned) || [];
  const autoMain = recentItems.slice(1, 6 - pinnedMain.length).map(item => ({
    title: item.title,
    url: item.url,
    timestamp: item.timestamp,
    pinned: false
  }));
  content.mainColumn = [...pinnedMain, ...autoMain];
  
  // Auto-populate columns
  const column1HasPlaceholders = content.column1.some(item => item.url.includes('example.com') || item.url.endsWith('.com') || item.url.endsWith('.com/'));
  const column2HasPlaceholders = content.column2.some(item => item.url.includes('example.com') || item.url.endsWith('.com') || item.url.endsWith('.com/'));
  const column3HasPlaceholders = content.column3.some(item => item.url.includes('example.com') || item.url.endsWith('.com') || item.url.endsWith('.com/'));
  
  if (content.column1.length === 0 || column1HasPlaceholders) {
    content.column1 = recentItems.slice(6, 11).map(item => ({ title: item.title, url: item.url }));
  }
  if (content.column2.length === 0 || column2HasPlaceholders) {
    content.column2 = recentItems.slice(11, 16).map(item => ({ title: item.title, url: item.url }));
  }
  if (content.column3.length === 0 || column3HasPlaceholders) {
    content.column3 = recentItems.slice(16, 21).map(item => ({ title: item.title, url: item.url }));
  }
  
  content.automated = recentItems;
  content.musicReleases = musicReleases.map(item => ({ title: item.title, url: item.url, timestamp: item.timestamp }));
  content.lastUpdated = new Date().toISOString();
  
  // Write to file
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
  
  return { recentItems, musicReleases, content };
}

/**
 * Update sitemap.xml with current timestamp
 * Called automatically when RSS fetcher updates content
 */
function updateSitemap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const sitemapPath = isProduction
    ? path.join(__dirname, '..', 'dist', 'public', 'sitemap.xml')
    : path.join(__dirname, '..', 'client', 'public', 'sitemap.xml');
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
  // 'https://consequenceofsound.net/feed/',      // DISABLED: Times out
  'https://www.thequietus.com/feed',           // Avant-garde, experimental
  'https://pitchfork.com/rss/news/',           // Music news
  'https://www.brooklynvegan.com/feed/',       // Indie, punk, underground
  'https://www.factmag.com/feed/',             // Electronic, club culture
  
  // Niche underground blogs
  // 'https://www.tinymixtapes.com/feed.xml',     // DISABLED: Times out
  'https://www.gorillavsbear.net/feed/',       // Indie, electronic, dream pop
  'https://www.passionweiss.com/feed/',        // Hip-hop, rap, underground
  'https://www.stereofox.com/feed/',           // Chillhop, indie electronic
  'https://www.dummymag.com/feed/',            // Electronic, experimental
  
  // Additional music and culture sources
  // 'https://www.clashmusic.com/feed',           // DISABLED: Times out
  'https://www.nme.com/feed',                  // Music news and culture
  // 'https://www.juxtapoz.com/feed',             // DISABLED: Times out
  'https://www.musicbusinessworldwide.com/feed', // Music industry news
  'https://www.rollingstone.com/feed/',        // Music news
  // 'https://www.goldminemag.com/feed',          // DISABLED: Times out
  // 'https://www.udiscovermusic.com/feed',       // DISABLED: Times out
  'https://www.npr.org/rss/rss.php?id=1039',   // NPR Music
  // 'https://www.thecurrent.org/feed',           // DISABLED: Returns 403 Forbidden
  // 'https://www.thatericalper.com/feed/',       // DISABLED: Times out
  'https://thirdmanrecords.com/blogs/news.atom', // Third Man Records
  'https://www.ravensingstheblues.com/feed/',  // Raven Sings the Blues
  // 'https://www.pastemagazine.com/rss/music',   // DISABLED: Returns 404
  'https://www.spin.com/feed/',                // Spin Magazine
  'https://daily.bandcamp.com/feed',           // Bandcamp Daily
  
  // Substack music publications
  'https://tedgioia.substack.com/feed',        // Ted Gioia - music history and culture
  // 'https://pennyfractions.substack.com/feed',  // DISABLED: Returns 404
  // 'https://daddrummer.substack.com/feed',      // DISABLED: Returns 404
  // 'https://aquariumdrunkard.substack.com/feed', // DISABLED: Returns 404
  'https://jasonpwoodbury.substack.com/feed',  // Jason P Woodbury - music journalism
  'https://whitedenim.substack.com/feed',      // White Denim - artist newsletter
  'https://jefftweedy.substack.com/feed',      // Jeff Tweedy - artist newsletter
  'https://chuckprophet.substack.com/feed',    // Chuck Prophet - artist newsletter
  'https://nekocase.substack.com/feed',        // Neko Case - artist newsletter
  'https://dusttodigital.substack.com/feed',   // Dust-to-Digital - record label
  'https://timnapalmstegall.substack.com/feed', // Tim Napalm Stegall - music writer
  'https://futurismrestated.substack.com/feed',  // Futurism Restated - music and culture
  
  // Additional music magazines and blogs
  'https://faroutmagazine.co.uk/feed/',          // Far Out Magazine - music and culture
  // 'https://www.undertheradarmag.com/feed',       // DISABLED: Returns 403 Forbidden
  'https://ultimateclassicrock.com/feed/',       // Ultimate Classic Rock
  
  // Entertainment and tech sources
  'https://deadline.com/feed/',                // Entertainment news
  'https://www.hollywoodreporter.com/feed/',   // Entertainment industry
  'https://www.indiewire.com/feed/',           // Independent film and TV
  'https://variety.com/feed/',                 // Entertainment news
  'https://www.theguardian.com/music/rss',     // Guardian music section
  'https://techcrunch.com/feed/',              // Tech and startups
  
  // New additions - Art, Culture, Music, Tech
  'https://www.artforum.com/feed/',            // Contemporary art
  'http://hyperallergic.com/feed/',            // Art news and criticism
  'https://www.avclub.com/feed/',              // Pop culture and entertainment
  'https://stereogum.com/category/news/feed/', // Music news and reviews
  'https://www.wired.com/feed/rss',            // Technology and culture
  'https://www.engadget.com/rss.xml',          // Tech news
  'https://gizmodo.com/tag/tech/rss',          // Tech and gadgets
  
  // Film Industry
  'https://www.thewrap.com/feed/',             // Film industry news
  'https://www.filmmakermagazine.com/feed/',   // Independent filmmaking
  'https://www.joblo.com/feed/',               // Movie news and reviews
  'https://feeds.feedburner.com/FilmSchoolRejects', // Film criticism
  
  // Music Industry (expanded)
  'https://www.billboard.com/feed/',           // Music charts and industry
  'https://www.musicradar.com/news/feed',      // Music gear and news
  'https://musically.com/feed/',               // Music industry analysis
  
  // Tech Industry (expanded)
  'https://www.theverge.com/rss/index.xml',    // Tech news and reviews
  'https://www.tomsguide.com/feeds/all',       // Tech guides and reviews
  'https://hackaday.com/feed/',                // Hardware hacking
  
  // Music Tech
  'https://www.attackmagazine.com/feed/',      // Electronic music production
  'https://cdm.link/feed/',                    // Create Digital Music
  'https://www.synthtopia.com/feed/',          // Synthesizers and music tech
  'https://www.gearnews.com/feed/',            // Music gear news
  'https://www.soundonsound.com/news/rss',     // Recording and audio
  'https://rekkerd.org/feed/',                 // Music software news
  
  // Blockchain / Web3
  'https://cointelegraph.com/rss',             // Crypto news
  'https://decrypt.co/feed',                   // Web3 and crypto
  'https://news.bitcoin.com/feed/',            // Bitcoin news
  'https://bitcoinmagazine.com/.rss/full/',    // Bitcoin magazine
  'https://cryptoslate.com/feed/',             // Crypto news and analysis
  
  // Artificial Intelligence
  'https://www.deepmind.com/blog/rss.xml',     // DeepMind research
  'https://syncedreview.com/feed/',            // AI research news
  'https://www.unite.ai/feed/',                // AI news and tutorials
  'https://www.marktechpost.com/feed/',        // AI and ML news
  'https://pub.towardsai.net/feed',            // AI education and news
  'https://www.aitimejournal.com/feed',        // AI industry journal
  
  // Future Tech / Emerging Tech
  'https://www.technologyreview.com/feed/',    // MIT Technology Review
  'https://singularityhub.com/feed/',          // Future tech and science
  'https://www.fastcompany.com/technology/rss', // Tech innovation
  'https://futurism.com/feed',                 // Futurism - future tech and science
  'https://www.wired.com/feed/category/science/latest/rss', // Science and tech
  'https://www.futurity.org/feed/',            // Research news
  'https://www.quantamagazine.org/feed/',      // Science and math
  'https://nautil.us/rss',                     // Science and culture
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
  
  // Advertising and promotional content
  'sale',
  'discount',
  'deal',
  'save up to',
  'off',
  '% off',
  'promo',
  'coupon',
  'free shipping',
  'limited time',
  'shop now',
  'buy now',
  'order now',
  'sponsored',
  'advertisement',
  
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
  'mayor',
  'mayoral',
  'campaign',
  'governor',
  'gubernatorial',
  'candidate',
  'vote',
  'voting',
  'ballot',
  'primary',
  
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

// Decode HTML entities to clean text
function decodeHTMLEntities(text) {
  const entities = {
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8216;': "'",
    '&#8217;': "'",
    '&#038;': '&',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8230;': '...',
  };
  
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  return decoded;
}

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
      
      const cleanTitle = title.replace(/<[^>]*>/g, ''); // Strip any HTML tags
      const decodedTitle = decodeHTMLEntities(cleanTitle); // Decode HTML entities
      
      items.push({
        title: decodedTitle,
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
    
    // Determine protocol from URL string
    const client = url.startsWith('https:') ? https : http;
    
    const request = client.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        if (res.headers.location) {
          // Handle relative redirects
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith('http')) {
            const urlObj = new URL(url);
            redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
          }
          return fetchFeed(redirectUrl, redirectCount + 1)
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
    });
    
    request.on('error', reject);
    
    // Set timeout to prevent hanging (reduced to 5s to fail faster)
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Main function
async function main() {
  console.log('🎵 RSS Fetcher v2.0 - Fetching latest music and culture news (with musicReleases support)...\n');
  
  const allItems = [];
  const isProduction = process.env.NODE_ENV === 'production';
  const contentPath = isProduction
    ? path.join(__dirname, '..', 'dist', 'public', 'data', 'content.json')
    : path.join(__dirname, '..', 'client', 'public', 'data', 'content.json');
  
  let feedCount = 0;
  const WRITE_INTERVAL = 15; // Write partial results every 15 feeds
  
  for (const feedUrl of FEEDS) {
    try {
      console.log(`Fetching: ${feedUrl}`);
      const xml = await fetchFeed(feedUrl);
      const items = parseRSS(xml);
      allItems.push(...items);
      console.log(`✓ Found ${items.length} items\n`);
      
      feedCount++;
      
      // Write partial results every WRITE_INTERVAL feeds
      if (feedCount % WRITE_INTERVAL === 0 && allItems.length > 0) {
        console.log(`💾 Writing partial results (${feedCount} feeds processed, ${allItems.length} items collected)...`);
        writeContent(allItems, contentPath);
      }
    } catch (error) {
      console.error(`✗ Failed to fetch ${feedUrl}: ${error.message}\n`);
    }
  }
  
  // Write final results
  console.log(`\n💾 Writing final results (${feedCount} total feeds processed, ${allItems.length} items collected)...`);
  const { recentItems, musicReleases, content } = writeContent(allItems, contentPath);
  
  console.log(`\n✓ Updated content.json with ${recentItems.length} automated links`);
  console.log(`Last updated: ${content.lastUpdated}`);
  
  // Update sitemap with current timestamp
  updateSitemap();
  
  // Generate RSS/Atom feeds for AI search engines
  try {
    const { execSync } = await import('child_process');
    execSync('node scripts/generate-rss.mjs', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  } catch (err) {
    console.error('✗ Failed to generate RSS feeds:', err.message);
  }
  
  // Update archive with splash headline
  const archivePath = isProduction
    ? path.join(__dirname, '..', 'dist', 'public', 'data', 'archive.json')
    : path.join(__dirname, '..', 'client', 'public', 'data', 'archive.json');
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



// Wrapper with timeout to ensure partial results are written
let timeoutHandle;
let isTimedOut = false;

const OVERALL_TIMEOUT = 150000; // 2.5 minutes

const timeoutPromise = new Promise((_, reject) => {
  timeoutHandle = setTimeout(() => {
    isTimedOut = true;
    reject(new Error('Overall timeout reached - writing partial results'));
  }, OVERALL_TIMEOUT);
});

Promise.race([main(), timeoutPromise])
  .then(() => {
    clearTimeout(timeoutHandle);
    console.log('\n✅ RSS fetch completed successfully');
  })
  .catch((error) => {
    clearTimeout(timeoutHandle);
    if (isTimedOut) {
      console.log('\n⏱️  Timeout reached - partial results should be written');
    } else {
      console.error('\n❌ RSS fetch failed:', error);
    }
  });
