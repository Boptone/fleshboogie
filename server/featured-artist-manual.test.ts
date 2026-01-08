/**
 * Tests for Featured Artist Manual Editing
 * Validates manual artist creation and editing workflow
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setFeaturedArtist,
  getActiveFeaturedArtist,
  deactivateFeaturedArtist,
} from './db-featured-artist.js';

describe('Featured Artist Manual Editing', () => {
  beforeEach(async () => {
    // Clean up before each test
    await deactivateFeaturedArtist();
  });

  it('should create featured artist with manual data (no MusicBrainz)', async () => {
    const manualData = {
      artistName: 'The Underground Collective',
      musicbrainzId: null,
      bio: 'An experimental electronic duo from Berlin pushing boundaries of ambient techno.',
      genres: JSON.stringify(['Ambient', 'Techno', 'Experimental']),
      originCountry: 'Germany',
      originCity: 'Berlin',
      formedYear: 2020,
      links: JSON.stringify({
        bandcamp: 'https://undergroundcollective.bandcamp.com',
        soundcloud: 'https://soundcloud.com/undergroundcollective',
        instagram: 'https://instagram.com/undergroundcollective',
      }),
      latestReleases: JSON.stringify([
        { title: 'Midnight Circuits', type: 'Album', date: '2024-11-15' },
        { title: 'Neon Dreams', type: 'EP', date: '2024-06-20' },
      ]),
      curatorNotes: 'Discovered at Berlin Atonal 2024. Incredible live performance.',
    };

    const artist = await setFeaturedArtist(manualData);

    expect(artist).toBeDefined();
    expect(artist.artistName).toBe('The Underground Collective');
    expect(artist.musicbrainzId).toBeNull();
    expect(artist.bio).toContain('experimental electronic duo');
    expect(artist.originCity).toBe('Berlin');
    expect(artist.formedYear).toBe(2020);
    expect(artist.isActive).toBe(1);

    // Verify JSON fields
    const genres = JSON.parse(artist.genres!);
    expect(genres).toContain('Ambient');
    expect(genres).toContain('Techno');

    const links = JSON.parse(artist.links!);
    expect(links.bandcamp).toContain('bandcamp.com');
    expect(links.soundcloud).toContain('soundcloud.com');

    const releases = JSON.parse(artist.latestReleases!);
    expect(releases).toHaveLength(2);
    expect(releases[0].title).toBe('Midnight Circuits');
  });

  it('should create featured artist with minimal manual data', async () => {
    const minimalData = {
      artistName: 'DJ Shadow Pulse',
      musicbrainzId: null,
      bio: 'Underground DJ from Los Angeles.',
      genres: null,
      originCountry: null,
      originCity: null,
      formedYear: null,
      links: null,
      latestReleases: null,
      curatorNotes: null,
    };

    const artist = await setFeaturedArtist(minimalData);

    expect(artist).toBeDefined();
    expect(artist.artistName).toBe('DJ Shadow Pulse');
    expect(artist.bio).toContain('Underground DJ');
    expect(artist.genres).toBeNull();
    expect(artist.links).toBeNull();
    expect(artist.isActive).toBe(1);
  });

  it('should handle manual artist with custom bio showcasing music expertise', async () => {
    const expertData = {
      artistName: 'Cassandra Gemini',
      musicbrainzId: null,
      bio: 'Cassandra Gemini is a visionary producer blending modular synthesis with field recordings from abandoned industrial sites. Her debut album "Rust & Resonance" (2023) received critical acclaim from The Wire and Resident Advisor. Drawing influence from Autechre, Aphex Twin, and early Detroit techno, she creates soundscapes that are both cerebral and deeply emotional. Her live performances are legendary for their improvisational nature—no two shows are ever the same.',
      genres: JSON.stringify(['IDM', 'Ambient', 'Modular', 'Experimental Techno']),
      originCountry: 'United States',
      originCity: 'Detroit',
      formedYear: 2019,
      links: JSON.stringify({
        bandcamp: 'https://cassandragemini.bandcamp.com',
        spotify: 'https://open.spotify.com/artist/cassandragemini',
        website: 'https://cassandragemini.com',
      }),
      latestReleases: JSON.stringify([
        { title: 'Rust & Resonance', type: 'Album', date: '2023-09-15' },
        { title: 'Signal/Noise', type: 'EP', date: '2024-03-01' },
      ]),
      curatorNotes: 'One of the most exciting producers in the underground scene right now. Her approach to modular synthesis is truly unique.',
    };

    const artist = await setFeaturedArtist(expertData);

    expect(artist).toBeDefined();
    expect(artist.artistName).toBe('Cassandra Gemini');
    expect(artist.bio).toContain('modular synthesis');
    expect(artist.bio).toContain('Autechre');
    expect(artist.bio).toContain('legendary');
    expect(artist.curatorNotes).toContain('most exciting producers');

    const genres = JSON.parse(artist.genres!);
    expect(genres).toContain('IDM');
    expect(genres).toContain('Modular');
  });

  it('should allow manual override of MusicBrainz data', async () => {
    // First, create an artist (simulating MusicBrainz data)
    const mbData = {
      artistName: 'The Velvet Underground',
      musicbrainzId: 'abc123',
      bio: 'Generic bio from MusicBrainz',
      genres: JSON.stringify(['Rock']),
      originCountry: 'United States',
      originCity: 'New York',
      formedYear: 1964,
      links: JSON.stringify({ website: 'https://example.com' }),
      latestReleases: null,
      curatorNotes: null,
    };

    await setFeaturedArtist(mbData);

    // Now override with manual data
    const manualOverride = {
      artistName: 'The Velvet Underground',
      musicbrainzId: null, // Clear MusicBrainz ID to indicate manual override
      bio: 'The Velvet Underground revolutionized rock music with their avant-garde approach, Lou Reed\'s poetic lyrics, and John Cale\'s experimental instrumentation. Their debut album with Andy Warhol\'s iconic banana cover is one of the most influential records ever made.',
      genres: JSON.stringify(['Art Rock', 'Proto-Punk', 'Experimental Rock']),
      originCountry: 'United States',
      originCity: 'New York City',
      formedYear: 1964,
      links: JSON.stringify({
        website: 'https://thevelvetunderground.com',
        spotify: 'https://open.spotify.com/artist/velvetunderground',
      }),
      latestReleases: JSON.stringify([
        { title: 'The Velvet Underground & Nico', type: 'Album', date: '1967-03-12' },
      ]),
      curatorNotes: 'Essential listening for anyone interested in the roots of alternative music.',
    };

    const artist = await setFeaturedArtist(manualOverride);

    expect(artist.artistName).toBe('The Velvet Underground');
    expect(artist.musicbrainzId).toBeNull(); // Manual override clears MB ID
    expect(artist.bio).toContain('revolutionized rock music');
    expect(artist.bio).not.toContain('Generic bio');

    const genres = JSON.parse(artist.genres!);
    expect(genres).toContain('Proto-Punk');
    expect(genres).not.toContain('Rock');
  });

  it('should handle all social media links correctly', async () => {
    const socialData = {
      artistName: 'Social Media Test Artist',
      musicbrainzId: null,
      bio: 'Test artist for social links',
      genres: null,
      originCountry: null,
      originCity: null,
      formedYear: null,
      links: JSON.stringify({
        website: 'https://example.com',
        bandcamp: 'https://example.bandcamp.com',
        spotify: 'https://open.spotify.com/artist/example',
        soundcloud: 'https://soundcloud.com/example',
        instagram: 'https://instagram.com/example',
        twitter: 'https://twitter.com/example',
      }),
      latestReleases: null,
      curatorNotes: null,
    };

    const artist = await setFeaturedArtist(socialData);

    const links = JSON.parse(artist.links!);
    expect(links.website).toBe('https://example.com');
    expect(links.bandcamp).toContain('bandcamp.com');
    expect(links.spotify).toContain('spotify.com');
    expect(links.soundcloud).toContain('soundcloud.com');
    expect(links.instagram).toContain('instagram.com');
    expect(links.twitter).toContain('twitter.com');
  });

  it('should retrieve manually created artist correctly', async () => {
    const manualData = {
      artistName: 'Retrieval Test Artist',
      musicbrainzId: null,
      bio: 'Testing retrieval',
      genres: JSON.stringify(['Test Genre']),
      originCountry: 'Test Country',
      originCity: 'Test City',
      formedYear: 2025,
      links: JSON.stringify({ website: 'https://test.com' }),
      latestReleases: JSON.stringify([{ title: 'Test Album', type: 'Album', date: '2025-01-01' }]),
      curatorNotes: 'Test notes',
    };

    await setFeaturedArtist(manualData);

    const retrieved = await getActiveFeaturedArtist();

    expect(retrieved).toBeDefined();
    expect(retrieved?.artistName).toBe('Retrieval Test Artist');
    expect(retrieved?.musicbrainzId).toBeNull();
    expect(retrieved?.bio).toBe('Testing retrieval');

    const genres = JSON.parse(retrieved!.genres!);
    expect(genres).toContain('Test Genre');

    const links = JSON.parse(retrieved!.links!);
    expect(links.website).toBe('https://test.com');

    const releases = JSON.parse(retrieved!.latestReleases!);
    expect(releases[0].title).toBe('Test Album');
  });
});
