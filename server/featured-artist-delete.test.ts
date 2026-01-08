/**
 * Test: Delete Featured Artist
 * Tests the ability to delete featured artists from the archive
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { getDb } from './db.js';
import { featuredArtist } from '../drizzle/schema.js';
import { 
  setFeaturedArtist, 
  getAllFeaturedArtists, 
  deleteFeaturedArtist 
} from './db-featured-artist.js';

describe('Delete Featured Artist', () => {
  beforeAll(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      await db.execute(sql`DELETE FROM ${featuredArtist}`);
    }
  });

  it('should delete a featured artist by ID', async () => {
    // Create a test artist
    const artist = await setFeaturedArtist({
      artistName: 'Delete Test Artist',
      musicbrainzId: null,
      bio: 'This artist will be deleted',
      genres: JSON.stringify(['Test Genre']),
      originCountry: 'Test Country',
      originCity: 'Test City',
      formedYear: 2025,
      links: JSON.stringify({ website: 'https://test.com' }),
      latestReleases: null,
      curatorNotes: 'Test notes',
    });

    // Verify artist was created
    let allArtists = await getAllFeaturedArtists();
    expect(allArtists).toHaveLength(1);
    expect(allArtists[0].artistName).toBe('Delete Test Artist');

    // Delete the artist
    await deleteFeaturedArtist(artist.id);

    // Verify artist was deleted
    allArtists = await getAllFeaturedArtists();
    expect(allArtists).toHaveLength(0);
  });

  it('should delete only the specified artist when multiple exist', async () => {
    // Create multiple test artists
    const artist1 = await setFeaturedArtist({
      artistName: 'Artist One',
      musicbrainzId: null,
      bio: 'First artist',
      genres: null,
      originCountry: null,
      originCity: null,
      formedYear: null,
      links: null,
      latestReleases: null,
      curatorNotes: null,
    });

    const artist2 = await setFeaturedArtist({
      artistName: 'Artist Two',
      musicbrainzId: null,
      bio: 'Second artist',
      genres: null,
      originCountry: null,
      originCity: null,
      formedYear: null,
      links: null,
      latestReleases: null,
      curatorNotes: null,
    });

    const artist3 = await setFeaturedArtist({
      artistName: 'Artist Three',
      musicbrainzId: null,
      bio: 'Third artist',
      genres: null,
      originCountry: null,
      originCity: null,
      formedYear: null,
      links: null,
      latestReleases: null,
      curatorNotes: null,
    });

    // Verify all three artists exist
    let allArtists = await getAllFeaturedArtists();
    expect(allArtists).toHaveLength(3);

    // Delete the middle artist
    await deleteFeaturedArtist(artist2.id);

    // Verify only artist2 was deleted
    allArtists = await getAllFeaturedArtists();
    expect(allArtists).toHaveLength(2);
    expect(allArtists.find(a => a.id === artist1.id)).toBeDefined();
    expect(allArtists.find(a => a.id === artist2.id)).toBeUndefined();
    expect(allArtists.find(a => a.id === artist3.id)).toBeDefined();
  });

  it('should handle deleting the currently active featured artist', async () => {
    // Clean up
    const db = await getDb();
    if (db) {
      await db.execute(sql`DELETE FROM ${featuredArtist}`);
    }

    // Create an active featured artist
    const activeArtist = await setFeaturedArtist({
      artistName: 'Active Artist',
      musicbrainzId: null,
      bio: 'Currently active',
      genres: null,
      originCountry: null,
      originCity: null,
      formedYear: null,
      links: null,
      latestReleases: null,
      curatorNotes: null,
    });

    // Verify artist is active
    expect(activeArtist.isActive).toBe(1);

    // Delete the active artist
    await deleteFeaturedArtist(activeArtist.id);

    // Verify artist was deleted
    const allArtists = await getAllFeaturedArtists();
    expect(allArtists).toHaveLength(0);
  });
});
