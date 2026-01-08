import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function FeaturedArtists() {
  const { data, isLoading } = trpc.featuredArtist.getAll.useQuery();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState<{ id: number; name: string } | null>(null);
  
  const utils = trpc.useUtils();
  const deleteMutation = trpc.featuredArtist.delete.useMutation({
    onSuccess: () => {
      toast.success(`${artistToDelete?.name} has been deleted`);
      utils.featuredArtist.getAll.invalidate();
      setDeleteDialogOpen(false);
      setArtistToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete artist: ${error.message}`);
    },
  });
  
  const handleDeleteClick = (id: number, name: string) => {
    setArtistToDelete({ id, name });
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (artistToDelete) {
      deleteMutation.mutate({ id: artistToDelete.id });
    }
  };

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
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-black uppercase">
                        {artist.artistName}
                        {artist.isActive === 1 && (
                          <span className="ml-3 text-sm bg-foreground text-background px-2 py-1">
                            CURRENT
                          </span>
                        )}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <time className="text-sm font-bold text-muted-foreground">
                        {new Date(artist.featuredAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(artist.id, artist.artistName)}
                        className="text-xs uppercase font-bold"
                      >
                        Delete
                      </Button>
                    </div>
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Featured Artist?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{artistToDelete?.name}</strong> from the Featured Artist archive? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
