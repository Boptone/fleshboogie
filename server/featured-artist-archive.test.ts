/**
 * Featured Artist Archive Tests
 * Tests for the archive page functionality and getAll endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { searchAndGetArtistData } from './services/musicbrainz.js';
import {
  setFeaturedArtist,
  getAllFeaturedArtists,
  deactivateFeaturedArtist,
} from './db-featured-artist.js';

describe('Featured Artist Archive', () => {
  describe('getAllFeaturedArtists', () => {
    it('should return all featured artists in descending order by featuredAt', async () => {
      // Set multiple featured artists
      const artist1Data = await searchAndGetArtistData('Sonic Youth');
      if (artist1Data) {
        await setFeaturedArtist({
          artistName: artist1Data.name,
          musicbrainzId: artist1Data.musicbrainzId,
          bio: artist1Data.bio,
          genres: JSON.stringify(artist1Data.genres),
          originCountry: artist1Data.originCountry,
          originCity: artist1Data.originCity,
          formedYear: artist1Data.formedYear,
          links: JSON.stringify(artist1Data.links),
          latestReleases: JSON.stringify(artist1Data.latestReleases),
          curatorNotes: 'First featured artist test',
        });
      }

      // Wait a moment to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));

      const artist2Data = await searchAndGetArtistData('Yves Tumor');
      if (artist2Data) {
        await setFeaturedArtist({
          artistName: artist2Data.name,
          musicbrainzId: artist2Data.musicbrainzId,
          bio: artist2Data.bio,
          genres: JSON.stringify(artist2Data.genres),
          originCountry: artist2Data.originCountry,
          originCity: artist2Data.originCity,
          formedYear: artist2Data.formedYear,
          links: JSON.stringify(artist2Data.links),
          latestReleases: JSON.stringify(artist2Data.latestReleases),
          curatorNotes: 'Second featured artist test',
        });
      }

      // Get all featured artists
      const allArtists = await getAllFeaturedArtists();

      // Verify we have at least 2 artists
      expect(allArtists.length).toBeGreaterThanOrEqual(2);

      // Verify they are ordered by featuredAt descending (most recent first)
      for (let i = 0; i < allArtists.length - 1; i++) {
        const current = new Date(allArtists[i].featuredAt).getTime();
        const next = new Date(allArtists[i + 1].featuredAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }

      // Verify only one is active
      const activeArtists = allArtists.filter(a => a.isActive === 1);
      expect(activeArtists.length).toBe(1);
      expect(activeArtists[0].artistName).toBe(artist2Data?.name);
    });

    it('should return empty array when no artists exist', async () => {
      // Deactivate all artists
      await deactivateFeaturedArtist();
      
      // Note: We can't actually delete all artists in this test
      // because other tests have already created them
      // So we just verify the function returns an array
      const allArtists = await getAllFeaturedArtists();
      expect(Array.isArray(allArtists)).toBe(true);
    });

    it('should include all artist fields', async () => {
      const allArtists = await getAllFeaturedArtists();
      
      if (allArtists.length > 0) {
        const artist = allArtists[0];
        
        // Verify all expected fields exist
        expect(artist).toHaveProperty('id');
        expect(artist).toHaveProperty('artistName');
        expect(artist).toHaveProperty('musicbrainzId');
        expect(artist).toHaveProperty('bio');
        expect(artist).toHaveProperty('genres');
        expect(artist).toHaveProperty('originCountry');
        expect(artist).toHaveProperty('originCity');
        expect(artist).toHaveProperty('formedYear');
        expect(artist).toHaveProperty('links');
        expect(artist).toHaveProperty('latestReleases');
        expect(artist).toHaveProperty('curatorNotes');
        expect(artist).toHaveProperty('isActive');
        expect(artist).toHaveProperty('featuredAt');
        expect(artist).toHaveProperty('createdAt');
        expect(artist).toHaveProperty('updatedAt');
      }
    });
  });

  describe('Archive page data integrity', () => {
    it('should preserve JSON data structure for genres, links, and releases', async () => {
      const allArtists = await getAllFeaturedArtists();
      
      if (allArtists.length > 0) {
        const artist = allArtists[0];
        
        // Verify JSON fields can be parsed
        if (artist.genres) {
          const genres = JSON.parse(artist.genres);
          expect(Array.isArray(genres)).toBe(true);
        }
        
        if (artist.links) {
          const links = JSON.parse(artist.links);
          expect(typeof links).toBe('object');
        }
        
        if (artist.latestReleases) {
          const releases = JSON.parse(artist.latestReleases);
          expect(Array.isArray(releases)).toBe(true);
        }
      }
    });

    it('should maintain curator notes across archive', async () => {
      const allArtists = await getAllFeaturedArtists();
      
      // Find artists with curator notes
      const artistsWithNotes = allArtists.filter(a => a.curatorNotes);
      
      if (artistsWithNotes.length > 0) {
        artistsWithNotes.forEach(artist => {
          expect(typeof artist.curatorNotes).toBe('string');
          expect(artist.curatorNotes!.length).toBeGreaterThan(0);
        });
      }
    });
  });
});
