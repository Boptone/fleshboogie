import { trpc } from "@/lib/trpc";

export function FeaturedArtistDisplay() {
  const { data, isLoading } = trpc.featuredArtist.getCurrent.useQuery();

  if (isLoading) return null;
  if (!data?.artist) return null;

  const artist = data.artist;

  return (
    <section className="mb-12 border-b-2 border-foreground pb-8">
      <h3 className="text-2xl md:text-3xl font-black uppercase mb-6 tracking-tight">
        FEATURED ARTIST
      </h3>

      <div className="space-y-4">
        {/* Artist Name and Origin */}
        <div>
          <h4 className="text-xl md:text-2xl font-black uppercase mb-2">
            {artist.artistName}
          </h4>
          {artist.originCity && artist.originCountry && (
            <p className="text-sm font-bold">
              {artist.originCity}, {artist.originCountry}
              {artist.formedYear && ` • Est. ${artist.formedYear}`}
            </p>
          )}
        </div>

        {/* Genres */}
        {artist.genres && artist.genres.length > 0 && (
          <div>
            <span className="text-sm font-bold uppercase">Genres: </span>
            <span className="text-sm">{artist.genres.join(", ")}</span>
          </div>
        )}

        {/* Bio */}
        {artist.bio && (
          <div>
            <p className="text-sm leading-relaxed">{artist.bio}</p>
          </div>
        )}

        {/* Curator Notes */}
        {artist.curatorNotes && (
          <div className="border-t border-foreground pt-4">
            <p className="text-sm font-bold uppercase mb-2">Curator Notes:</p>
            <p className="text-sm leading-relaxed italic">{artist.curatorNotes}</p>
          </div>
        )}

        {/* Latest Releases */}
        {artist.latestReleases && artist.latestReleases.length > 0 && (
          <div>
            <p className="text-sm font-bold uppercase mb-2">Latest Releases:</p>
            <ul className="space-y-1">
              {artist.latestReleases.map((release: any, index: number) => (
                <li key={index} className="text-sm">
                  • {release.title} ({release.type}, {release.date})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        {artist.links && Object.keys(artist.links).length > 0 && (
          <div>
            <p className="text-sm font-bold uppercase mb-2">Links:</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(artist.links).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm uppercase font-bold underline hover:bg-foreground hover:text-background transition-none px-2 py-1"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
