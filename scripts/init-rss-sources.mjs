/**
 * Initialize RSS Source Config Table
 * 
 * This script populates the rss_source_config table with all RSS sources
 * from the fetch-feeds.mjs script, categorizing them and setting initial config.
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { rssSourceConfig } from '../drizzle/schema.ts';
import dotenv from 'dotenv';

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// RSS sources with metadata
const RSS_SOURCES = [
  // Core independent music sources
  { url: 'https://consequenceofsound.net/feed/', name: 'Consequence', category: 'music' },
  { url: 'https://www.thequietus.com/feed', name: 'The Quietus', category: 'music' },
  { url: 'https://pitchfork.com/rss/news/', name: 'Pitchfork', category: 'music' },
  { url: 'https://www.brooklynvegan.com/feed/', name: 'Brooklyn Vegan', category: 'music' },
  { url: 'https://www.factmag.com/feed/', name: 'FACT Magazine', category: 'music' },
  
  // Niche underground blogs
  { url: 'https://www.tinymixtapes.com/feed.xml', name: 'Tiny Mix Tapes', category: 'music' },
  { url: 'https://www.gorillavsbear.net/feed/', name: 'Gorilla vs. Bear', category: 'music' },
  { url: 'https://www.passionweiss.com/feed/', name: 'Passion of the Weiss', category: 'music' },
  { url: 'https://www.stereofox.com/feed/', name: 'Stereofox', category: 'music' },
  { url: 'https://www.dummymag.com/feed/', name: 'Dummy Mag', category: 'music' },
  
  // Additional music and culture sources
  { url: 'https://www.clashmusic.com/feed', name: 'Clash Music', category: 'music' },
  { url: 'https://www.nme.com/feed', name: 'NME', category: 'music' },
  { url: 'https://www.juxtapoz.com/feed', name: 'Juxtapoz', category: 'culture' },
  { url: 'https://www.musicbusinessworldwide.com/feed', name: 'Music Business Worldwide', category: 'music' },
  { url: 'https://www.rollingstone.com/feed/', name: 'Rolling Stone', category: 'music' },
  { url: 'https://www.goldminemag.com/feed', name: 'Goldmine Magazine', category: 'music' },
  { url: 'https://www.udiscovermusic.com/feed', name: 'uDiscover Music', category: 'music' },
  { url: 'https://www.npr.org/rss/rss.php?id=1039', name: 'NPR Music', category: 'music' },
  { url: 'https://www.thecurrent.org/feed', name: 'The Current', category: 'music' },
  { url: 'https://www.thatericalper.com/feed/', name: 'That Eric Alper', category: 'music' },
  { url: 'https://thirdmanrecords.com/blogs/news.atom', name: 'Third Man Records', category: 'music' },
  { url: 'https://www.ravensingstheblues.com/feed/', name: 'Raven Sings the Blues', category: 'music' },
  { url: 'https://www.pastemagazine.com/rss/music', name: 'Paste Magazine Music', category: 'music' },
  { url: 'https://www.spin.com/feed/', name: 'Spin Magazine', category: 'music' },
  { url: 'https://daily.bandcamp.com/feed', name: 'Bandcamp Daily', category: 'music' },
  
  // Substack music publications
  { url: 'https://tedgioia.substack.com/feed', name: 'Ted Gioia', category: 'music' },
  { url: 'https://pennyfractions.substack.com/feed', name: 'Penny Fractions', category: 'music' },
  { url: 'https://daddrummer.substack.com/feed', name: 'Dada Drummer Almanach', category: 'music' },
  { url: 'https://aquariumdrunkard.substack.com/feed', name: 'Aquarium Drunkard', category: 'music' },
  { url: 'https://jasonpwoodbury.substack.com/feed', name: 'Jason P Woodbury', category: 'music' },
  { url: 'https://whitedenim.substack.com/feed', name: 'White Denim', category: 'music' },
  { url: 'https://jefftweedy.substack.com/feed', name: 'Jeff Tweedy', category: 'music' },
  { url: 'https://chuckprophet.substack.com/feed', name: 'Chuck Prophet', category: 'music' },
  { url: 'https://nekocase.substack.com/feed', name: 'Neko Case', category: 'music' },
  { url: 'https://dusttodigital.substack.com/feed', name: 'Dust-to-Digital', category: 'music' },
  { url: 'https://timnapalmstegall.substack.com/feed', name: 'Tim Napalm Stegall', category: 'music' },
  
  // Entertainment and tech sources
  { url: 'https://deadline.com/feed/', name: 'Deadline', category: 'entertainment' },
  { url: 'https://www.hollywoodreporter.com/feed/', name: 'Hollywood Reporter', category: 'entertainment' },
  { url: 'https://www.indiewire.com/feed/', name: 'IndieWire', category: 'entertainment' },
  { url: 'https://variety.com/feed/', name: 'Variety', category: 'entertainment' },
  { url: 'https://www.theguardian.com/music/rss', name: 'Guardian Music', category: 'music' },
  { url: 'https://techcrunch.com/feed/', name: 'TechCrunch', category: 'tech' },
  
  // Art, Culture, Music, Tech
  { url: 'https://www.artforum.com/feed/', name: 'Artforum', category: 'culture' },
  { url: 'http://hyperallergic.com/feed/', name: 'Hyperallergic', category: 'culture' },
  { url: 'https://www.avclub.com/feed/', name: 'AV Club', category: 'entertainment' },
  { url: 'https://stereogum.com/category/news/feed/', name: 'Stereogum', category: 'music' },
  { url: 'https://www.wired.com/feed/rss', name: 'WIRED', category: 'tech' },
  { url: 'https://www.engadget.com/rss.xml', name: 'Engadget', category: 'tech' },
  { url: 'https://gizmodo.com/tag/tech/rss', name: 'Gizmodo Tech', category: 'tech' },
  
  // Film Industry
  { url: 'https://www.thewrap.com/feed/', name: 'The Wrap', category: 'entertainment' },
  { url: 'https://www.filmmakermagazine.com/feed/', name: 'Filmmaker Magazine', category: 'entertainment' },
  { url: 'https://www.joblo.com/feed/', name: 'JoBlo', category: 'entertainment' },
  { url: 'https://feeds.feedburner.com/FilmSchoolRejects', name: 'Film School Rejects', category: 'entertainment' },
  
  // Music Industry (expanded)
  { url: 'https://www.billboard.com/feed/', name: 'Billboard', category: 'music' },
  { url: 'https://www.musicradar.com/news/feed', name: 'Music Radar', category: 'music' },
  { url: 'https://musically.com/feed/', name: 'MusicAlly', category: 'music' },
  
  // Tech Industry (expanded)
  { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge', category: 'tech' },
  { url: 'https://www.tomsguide.com/feeds/all', name: "Tom's Guide", category: 'tech' },
  { url: 'https://hackaday.com/feed/', name: 'Hackaday', category: 'tech' },
  
  // Music Tech
  { url: 'https://www.attackmagazine.com/feed/', name: 'Attack Magazine', category: 'tech' },
  { url: 'https://cdm.link/feed/', name: 'Create Digital Music', category: 'tech' },
  { url: 'https://www.synthtopia.com/feed/', name: 'Synthtopia', category: 'tech' },
  { url: 'https://www.gearnews.com/feed/', name: 'Gearnews', category: 'tech' },
  { url: 'https://www.soundonsound.com/news/rss', name: 'Sound on Sound', category: 'tech' },
  { url: 'https://rekkerd.org/feed/', name: 'Rekkerd', category: 'tech' },
  
  // Blockchain / Web3
  { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph', category: 'tech' },
  { url: 'https://decrypt.co/feed', name: 'Decrypt', category: 'tech' },
  { url: 'https://news.bitcoin.com/feed/', name: 'Bitcoin News', category: 'tech' },
  { url: 'https://bitcoinmagazine.com/.rss/full/', name: 'Bitcoin Magazine', category: 'tech' },
  { url: 'https://cryptoslate.com/feed/', name: 'CryptoSlate', category: 'tech' },
  
  // Artificial Intelligence
  { url: 'https://www.deepmind.com/blog/rss.xml', name: 'DeepMind', category: 'tech' },
  { url: 'https://syncedreview.com/feed/', name: 'Synced Review', category: 'tech' },
  { url: 'https://www.unite.ai/feed/', name: 'Unite AI', category: 'tech' },
  { url: 'https://www.marktechpost.com/feed/', name: 'MarkTechPost', category: 'tech' },
  { url: 'https://pub.towardsai.net/feed', name: 'Towards AI', category: 'tech' },
  { url: 'https://www.aitimejournal.com/feed', name: 'AI Time Journal', category: 'tech' },
  
  // Future Tech / Emerging Tech
  { url: 'https://www.technologyreview.com/feed/', name: 'MIT Technology Review', category: 'tech' },
  { url: 'https://singularityhub.com/feed/', name: 'Singularity Hub', category: 'tech' },
  { url: 'https://www.fastcompany.com/technology/rss', name: 'Fast Company Tech', category: 'tech' },
  { url: 'https://futurism.com/feed', name: 'Futurism', category: 'tech' },
  { url: 'https://www.wired.com/feed/category/science/latest/rss', name: 'WIRED Science', category: 'tech' },
  { url: 'https://www.futurity.org/feed/', name: 'Futurity', category: 'tech' },
  { url: 'https://www.quantamagazine.org/feed/', name: 'Quanta Magazine', category: 'tech' },
  { url: 'https://nautil.us/rss', name: 'Nautilus', category: 'culture' },
];

async function initializeSources() {
  console.log(`Initializing ${RSS_SOURCES.length} RSS sources...`);
  
  for (const source of RSS_SOURCES) {
    try {
      await db.insert(rssSourceConfig).values({
        sourceUrl: source.url,
        sourceName: source.name,
        category: source.category,
        isEnabled: 1,
        isMonitored: 1,
        totalFetches: 0,
        successfulFetches: 0,
        successRate: 100,
        averageQualityScore: 0,
      }).onDuplicateKeyUpdate({
        set: {
          sourceName: source.name,
          category: source.category,
        },
      });
      
      console.log(`✓ ${source.name} (${source.category})`);
    } catch (error) {
      console.error(`✗ Failed to insert ${source.name}:`, error.message);
    }
  }
  
  console.log('\n✓ RSS sources initialized successfully!');
  process.exit(0);
}

initializeSources().catch((error) => {
  console.error('Failed to initialize sources:', error);
  process.exit(1);
});
