import { trpc } from "@/lib/trpc";

export default function FeaturedArtists() {
  const { data, isLoading } = trpc.featuredArtist.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-8">
            Featured Artist Archive ⚡
          </h1>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const artists = data?.artists || [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <a
            href="/"
            className="text-sm uppercase font-bold underline hover:bg-foreground hover:text-background transition-none px-2 py-1 inline-block mb-6"
          >
            ← Back to Home
          </a>
          <h1 className="text-4xl md:text-6xl font-black uppercase mb-4 tracking-tight">
            Featured Artist Archive ⚡
          </h1>
          <p className="text-lg font-bold">
            A chronological catalog of all artists featured on FLESHBOOGIE
          </p>
        </div>

        {/* Artists Grid */}
        {artists.length === 0 ? (
          <div className="border-2 border-foreground p-8 text-center">
            <p className="text-lg font-bold">No featured artists yet.</p>
            <p className="text-sm mt-2">Check back soon for our first spotlight!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {artists.map((artist: any) => (
              <article
                key={artist.id}
                className="border-2 border-foreground p-6 hover:bg-muted/10 transition-none"
              >
                {/* Artist Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl md:text-3xl font-black uppercase">
                      {artist.artistName}
                      {artist.isActive === 1 && (
                        <span className="ml-3 text-sm bg-foreground text-background px-2 py-1">
                          CURRENT
                        </span>
                      )}
                    </h2>
                    <time className="text-sm font-bold text-muted-foreground">
                      {new Date(artist.featuredAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>

                  {/* Origin */}
                  {artist.originCity && artist.originCountry && (
                    <p className="text-sm font-bold text-muted-foreground">
                      {artist.originCity}, {artist.originCountry}
                      {artist.formedYear && ` • Est. ${artist.formedYear}`}
                    </p>
                  )}
                </div>

                {/* Genres */}
                {artist.genres && artist.genres.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-bold uppercase">Genres: </span>
                    <span className="text-sm">{artist.genres.join(", ")}</span>
                  </div>
                )}

                {/* Bio */}
                {artist.bio && (
                  <div className="mb-4">
                    <p className="text-sm leading-relaxed line-clamp-3">{artist.bio}</p>
                  </div>
                )}

                {/* Curator Notes */}
                {artist.curatorNotes && (
                  <div className="border-t border-foreground pt-4 mb-4">
                    <p className="text-sm font-bold uppercase mb-2">Curator Notes:</p>
                    <p className="text-sm leading-relaxed italic">{artist.curatorNotes}</p>
                  </div>
                )}

                {/* Latest Releases */}
                {artist.latestReleases && artist.latestReleases.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-bold uppercase mb-2">Latest Releases:</p>
                    <ul className="space-y-1">
                      {artist.latestReleases.slice(0, 3).map((release: any, index: number) => (
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
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
