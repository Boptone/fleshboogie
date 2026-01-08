/**
 * Featured Artist tRPC Router
 * Handles setting and retrieving featured artist data
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc.js';
import { searchAndGetArtistData } from '../services/musicbrainz.js';
import {
  getActiveFeaturedArtist,
  setFeaturedArtist,
  updateFeaturedArtist,
  deactivateFeaturedArtist,
} from '../db-featured-artist.js';

export const featuredArtistRouter = router({
  /**
   * Get the currently active featured artist (public)
   */
  getCurrent: publicProcedure.query(async () => {
    const artist = await getActiveFeaturedArtist();
    
    if (!artist) {
      return { success: true, artist: null };
    }
    
    // Parse JSON fields
    return {
      success: true,
      artist: {
        ...artist,
        genres: artist.genres ? JSON.parse(artist.genres) : [],
        links: artist.links ? JSON.parse(artist.links) : {},
        latestReleases: artist.latestReleases ? JSON.parse(artist.latestReleases) : [],
      },
    };
  }),

  /**
   * Set a new featured artist by name (admin only)
   * Auto-populates data from MusicBrainz
   */
  setByName: protectedProcedure
    .input(
      z.object({
        artistName: z.string().min(1),
        curatorNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Search MusicBrainz for artist data
      const artistData = await searchAndGetArtistData(input.artistName);
      
      if (!artistData) {
        return {
          success: false,
          error: `Artist "${input.artistName}" not found in MusicBrainz database`,
        };
      }
      
      // Set as featured artist
      const newArtist = await setFeaturedArtist({
        artistName: artistData.name,
        musicbrainzId: artistData.musicbrainzId,
        bio: artistData.bio,
        genres: JSON.stringify(artistData.genres),
        originCountry: artistData.originCountry,
        originCity: artistData.originCity,
        formedYear: artistData.formedYear,
        links: JSON.stringify(artistData.links),
        latestReleases: JSON.stringify(artistData.latestReleases),
        curatorNotes: input.curatorNotes,
      });
      
      return {
        success: true,
        artist: {
          ...newArtist,
          genres: JSON.parse(newArtist.genres || '[]'),
          links: JSON.parse(newArtist.links || '{}'),
          latestReleases: JSON.parse(newArtist.latestReleases || '[]'),
        },
      };
    }),

  /**
   * Update featured artist curator notes (admin only)
   */
  updateNotes: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        curatorNotes: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await updateFeaturedArtist(input.id, {
        curatorNotes: input.curatorNotes,
      });
      
      return { success: true };
    }),

  /**
   * Deactivate current featured artist (admin only)
   */
  deactivate: protectedProcedure.mutation(async () => {
    await deactivateFeaturedArtist();
    return { success: true };
  }),
});
