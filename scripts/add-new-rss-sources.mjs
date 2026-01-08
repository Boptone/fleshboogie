import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { rssSourceConfig } from '../drizzle/schema.js';

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const newSources = [
  {
    name: 'Futurism Restated',
    url: 'https://futurismrestated.substack.com/feed',
    category: 'music',
    enabled: true
  },
  {
    name: 'Far Out Magazine',
    url: 'https://faroutmagazine.co.uk/feed/',
    category: 'music',
    enabled: true
  },
  {
    name: 'Under the Radar',
    url: 'https://www.undertheradarmag.com/feed',
    category: 'music',
    enabled: true
  },
  {
    name: 'Ultimate Classic Rock',
    url: 'https://ultimateclassicrock.com/feed/',
    category: 'music',
    enabled: true
  }
];

async function addNewSources() {
  console.log('Adding new RSS sources to database...\n');
  
  for (const source of newSources) {
    try {
      await db.insert(rssSourceConfig).values(source);
      console.log(`✓ Added: ${source.name}`);
    } catch (error) {
      console.error(`✗ Failed to add ${source.name}:`, error.message);
    }
  }
  
  console.log('\n✓ Done! New sources added to database.');
  await pool.end();
}

addNewSources();
