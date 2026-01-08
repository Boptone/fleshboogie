/**
 * Featured Artist tRPC Router
 * Handles setting and retrieving featured artist data
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc.js';
import { searchAndGetArtistData } from '../services/musicbrainz.js';
import {
  getActiveFeaturedArtist,
  getAllFeaturedArtists,
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
   * Set featured artist with manual data (admin only)
   * Allows creating artist profiles from scratch or overriding MusicBrainz data
   */
  setManual: protectedProcedure
    .input(
      z.object({
        artistName: z.string().min(1),
        bio: z.string().optional(),
        genres: z.array(z.string()).optional(),
        originCity: z.string().optional(),
        originCountry: z.string().optional(),
        formedYear: z.number().optional(),
        website: z.string().optional(),
        bandcamp: z.string().optional(),
        spotify: z.string().optional(),
        soundcloud: z.string().optional(),
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        latestReleases: z.array(
          z.object({
            title: z.string(),
            type: z.string(),
            date: z.string(),
          })
        ).optional(),
        curatorNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Build links object
      const links: any = {};
      if (input.website) links.website = input.website;
      if (input.bandcamp) links.bandcamp = input.bandcamp;
      if (input.spotify) links.spotify = input.spotify;
      if (input.soundcloud) links.soundcloud = input.soundcloud;
      if (input.instagram) links.instagram = input.instagram;
      if (input.twitter) links.twitter = input.twitter;
      
      // Set as featured artist
      const newArtist = await setFeaturedArtist({
        artistName: input.artistName,
        musicbrainzId: null,
        bio: input.bio || null,
        genres: input.genres ? JSON.stringify(input.genres) : null,
        originCountry: input.originCountry || null,
        originCity: input.originCity || null,
        formedYear: input.formedYear || null,
        links: Object.keys(links).length > 0 ? JSON.stringify(links) : null,
        latestReleases: input.latestReleases ? JSON.stringify(input.latestReleases) : null,
        curatorNotes: input.curatorNotes || null,
      });
      
      return {
        success: true,
        artist: {
          ...newArtist,
          genres: newArtist.genres ? JSON.parse(newArtist.genres) : [],
          links: newArtist.links ? JSON.parse(newArtist.links) : {},
          latestReleases: newArtist.latestReleases ? JSON.parse(newArtist.latestReleases) : [],
        },
      };
    }),

  /**
   * Deactivate current featured artist (admin only)
   */
  deactivate: protectedProcedure.mutation(async () => {
    await deactivateFeaturedArtist();
    return { success: true };
  }),

  /**
   * Get all featured artists (archive/history) (public)
   */
  getAll: publicProcedure.query(async () => {
    const artists = await getAllFeaturedArtists();
    
    // Parse JSON fields for each artist
    return {
      success: true,
      artists: artists.map(artist => ({
        ...artist,
        genres: artist.genres ? JSON.parse(artist.genres) : [],
        links: artist.links ? JSON.parse(artist.links) : {},
        latestReleases: artist.latestReleases ? JSON.parse(artist.latestReleases) : [],
      })),
    };
  }),
});
