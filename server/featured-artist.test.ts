/**
 * Featured Artist Tests
 * Tests for MusicBrainz integration and featured artist functionality
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  getActiveFeaturedArtist,
  setFeaturedArtist,
  deactivateFeaturedArtist,
} from './db-featured-artist.js';
import { searchAndGetArtistData } from './services/musicbrainz.js';

describe('Featured Artist - MusicBrainz Integration', () => {
  it('should search for an artist and return data from MusicBrainz', async () => {
    // Test with a well-known artist
    const artistData = await searchAndGetArtistData('Radiohead');
    
    expect(artistData).toBeDefined();
    expect(artistData?.name).toBe('Radiohead');
    expect(artistData?.musicbrainzId).toBeDefined();
    expect(artistData?.genres).toBeDefined();
    expect(Array.isArray(artistData?.genres)).toBe(true);
  }, 15000); // Allow 15 seconds for API call

  it('should return null for non-existent artist', async () => {
    const artistData = await searchAndGetArtistData('ThisArtistDefinitelyDoesNotExist12345');
    
    expect(artistData).toBeNull();
  }, 15000);

  it('should extract links from artist data', async () => {
    const artistData = await searchAndGetArtistData('Radiohead');
    
    expect(artistData).toBeDefined();
    expect(artistData?.links).toBeDefined();
    expect(typeof artistData?.links).toBe('object');
  }, 15000);
});

describe('Featured Artist - Database Operations', () => {
  it('should set a featured artist', async () => {
    const testArtist = {
      artistName: 'Test Artist',
      musicbrainzId: 'test-123',
      bio: 'Test bio',
      genres: JSON.stringify(['rock', 'indie']),
      originCountry: 'US',
      originCity: 'Los Angeles',
      formedYear: 2020,
      links: JSON.stringify({ website: 'https://example.com' }),
      latestReleases: JSON.stringify([
        { title: 'Test Album', date: '2024-01-01', type: 'album' },
      ]),
      curatorNotes: 'This is a test artist',
    };

    const result = await setFeaturedArtist(testArtist);
    
    expect(result).toBeDefined();
    expect(result.artistName).toBe('Test Artist');
    expect(result.isActive).toBe(1);
  });

  it('should get the currently active featured artist', async () => {
    const artist = await getActiveFeaturedArtist();
    
    expect(artist).toBeDefined();
    expect(artist?.isActive).toBe(1);
  });

  it('should deactivate featured artist', async () => {
    await deactivateFeaturedArtist();
    
    const artist = await getActiveFeaturedArtist();
    expect(artist).toBeNull();
  });

  it('should only have one active featured artist at a time', async () => {
    // Set first artist
    await setFeaturedArtist({
      artistName: 'Artist One',
      musicbrainzId: 'test-1',
      genres: JSON.stringify(['rock']),
      links: JSON.stringify({}),
      latestReleases: JSON.stringify([]),
    });

    // Set second artist
    await setFeaturedArtist({
      artistName: 'Artist Two',
      musicbrainzId: 'test-2',
      genres: JSON.stringify(['jazz']),
      links: JSON.stringify({}),
      latestReleases: JSON.stringify([]),
    });

    // Only the second artist should be active
    const activeArtist = await getActiveFeaturedArtist();
    expect(activeArtist).toBeDefined();
    expect(activeArtist?.artistName).toBe('Artist Two');
  });
});

describe('Featured Artist - End-to-End Flow', () => {
  it('should complete full workflow: search, set, retrieve, deactivate', async () => {
    // Step 1: Search for artist on MusicBrainz
    const artistData = await searchAndGetArtistData('Sonic Youth');
    expect(artistData).toBeDefined();

    // Step 2: Set as featured artist
    if (artistData) {
      const featuredArtist = await setFeaturedArtist({
        artistName: artistData.name,
        musicbrainzId: artistData.musicbrainzId,
        bio: artistData.bio,
        genres: JSON.stringify(artistData.genres),
        originCountry: artistData.originCountry,
        originCity: artistData.originCity,
        formedYear: artistData.formedYear,
        links: JSON.stringify(artistData.links),
        latestReleases: JSON.stringify(artistData.latestReleases),
        curatorNotes: 'Legendary noise rock pioneers from NYC',
      });

      expect(featuredArtist).toBeDefined();
      expect(featuredArtist.artistName).toBe(artistData.name);
    }

    // Step 3: Retrieve active featured artist
    const activeArtist = await getActiveFeaturedArtist();
    expect(activeArtist).toBeDefined();
    expect(activeArtist?.artistName).toBe(artistData?.name);
    expect(activeArtist?.curatorNotes).toBe('Legendary noise rock pioneers from NYC');

    // Step 4: Deactivate
    await deactivateFeaturedArtist();
    const noArtist = await getActiveFeaturedArtist();
    expect(noArtist).toBeNull();
  }, 20000);
});
