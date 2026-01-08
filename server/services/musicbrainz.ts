/**
 * MusicBrainz API Service
 * Fetches artist data from MusicBrainz API for Featured Artist spotlight
 * API Docs: https://musicbrainz.org/doc/MusicBrainz_API
 */

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'FLESHBOOGIE/1.0 (https://fleshboogie.com)';

export interface ArtistData {
  name: string;
  musicbrainzId: string;
  bio?: string;
  genres: string[];
  originCountry?: string;
  originCity?: string;
  formedYear?: number;
  links: {
    website?: string;
    bandcamp?: string;
    spotify?: string;
    soundcloud?: string;
    instagram?: string;
    twitter?: string;
  };
  latestReleases: Array<{
    title: string;
    date: string;
    type: string; // 'album', 'ep', 'single'
  }>;
}

/**
 * Search for an artist by name
 */
export async function searchArtist(artistName: string): Promise<{ id: string; name: string; disambiguation?: string }[]> {
  const query = encodeURIComponent(artistName);
  const url = `${MUSICBRAINZ_API}/artist/?query=${query}&fmt=json&limit=5`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });
  
  if (!response.ok) {
    throw new Error(`MusicBrainz API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return data.artists.map((artist: any) => ({
    id: artist.id,
    name: artist.name,
    disambiguation: artist.disambiguation,
  }));
}

/**
 * Get detailed artist information
 */
export async function getArtistData(musicbrainzId: string): Promise<ArtistData> {
  // Fetch artist details with relations and releases
  const url = `${MUSICBRAINZ_API}/artist/${musicbrainzId}?inc=url-rels+genres+tags+release-groups&fmt=json`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });
  
  if (!response.ok) {
    throw new Error(`MusicBrainz API error: ${response.statusText}`);
  }
  
  const artist = await response.json();
  
  // Extract genres from tags and genres
  const genres = new Set<string>();
  if (artist.genres) {
    artist.genres.forEach((g: any) => genres.add(g.name));
  }
  if (artist.tags) {
    artist.tags.slice(0, 5).forEach((t: any) => genres.add(t.name));
  }
  
  // Extract links
  const links: ArtistData['links'] = {};
  if (artist.relations) {
    artist.relations.forEach((rel: any) => {
      if (rel.type === 'official homepage') {
        links.website = rel.url.resource;
      } else if (rel.url?.resource?.includes('bandcamp.com')) {
        links.bandcamp = rel.url.resource;
      } else if (rel.url?.resource?.includes('spotify.com')) {
        links.spotify = rel.url.resource;
      } else if (rel.url?.resource?.includes('soundcloud.com')) {
        links.soundcloud = rel.url.resource;
      } else if (rel.url?.resource?.includes('instagram.com')) {
        links.instagram = rel.url.resource;
      } else if (rel.url?.resource?.includes('twitter.com') || rel.url?.resource?.includes('x.com')) {
        links.twitter = rel.url.resource;
      }
    });
  }
  
  // Extract latest releases (albums, EPs, singles from past 2 years)
  const latestReleases: ArtistData['latestReleases'] = [];
  if (artist['release-groups']) {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    artist['release-groups']
      .filter((rg: any) => {
        const releaseDate = new Date(rg['first-release-date']);
        return releaseDate >= twoYearsAgo && ['Album', 'EP', 'Single'].includes(rg['primary-type']);
      })
      .sort((a: any, b: any) => {
        return new Date(b['first-release-date']).getTime() - new Date(a['first-release-date']).getTime();
      })
      .slice(0, 5)
      .forEach((rg: any) => {
        latestReleases.push({
          title: rg.title,
          date: rg['first-release-date'],
          type: rg['primary-type'].toLowerCase(),
        });
      });
  }
  
  // Extract origin info
  const originCountry = artist.country;
  const originCity = artist.area?.name;
  const formedYear = artist['life-span']?.begin ? parseInt(artist['life-span'].begin.split('-')[0]) : undefined;
  
  return {
    name: artist.name,
    musicbrainzId: artist.id,
    genres: Array.from(genres),
    originCountry,
    originCity,
    formedYear,
    links,
    latestReleases,
  };
}

/**
 * Search for artist and get full data in one call
 */
export async function searchAndGetArtistData(artistName: string): Promise<ArtistData | null> {
  const searchResults = await searchArtist(artistName);
  
  if (searchResults.length === 0) {
    return null;
  }
  
  // Use the first (best) match
  const artistId = searchResults[0].id;
  return await getArtistData(artistId);
}
