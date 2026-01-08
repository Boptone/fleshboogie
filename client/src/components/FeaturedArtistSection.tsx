import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export function FeaturedArtistSection() {
  const [artistName, setArtistName] = useState("");
  const [curatorNotes, setCuratorNotes] = useState("");

  // Get current featured artist
  const { data: currentArtist, refetch } = trpc.featuredArtist.getCurrent.useQuery();

  // Set featured artist mutation
  const setArtistMutation = trpc.featuredArtist.setByName.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Featured artist set to: ${data.artist?.artistName}`);
        setArtistName("");
        setCuratorNotes("");
        refetch();
      } else {
        toast.error(data.error || "Failed to set featured artist");
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Deactivate featured artist mutation
  const deactivateMutation = trpc.featuredArtist.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Featured artist deactivated");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSetArtist = () => {
    if (!artistName.trim()) {
      toast.error("Please enter an artist name");
      return;
    }

    setArtistMutation.mutate({
      artistName: artistName.trim(),
      curatorNotes: curatorNotes.trim() || undefined,
    });
  };

  const handleDeactivate = () => {
    if (confirm("Are you sure you want to remove the featured artist?")) {
      deactivateMutation.mutate();
    }
  };

  const artist = currentArtist?.artist;

  return (
    <section className="border-2 border-foreground p-6">
      <h2 className="text-2xl font-black uppercase mb-4">Fleshboogie Featured Artist Spotlight</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Set a featured artist to highlight on the homepage. Data is auto-populated from MusicBrainz.
      </p>

      {/* Current Featured Artist */}
      {artist && (
        <div className="mb-6 p-4 border border-foreground bg-muted/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-black uppercase">{artist.artistName}</h3>
              {artist.originCity && artist.originCountry && (
                <p className="text-sm text-muted-foreground">
                  {artist.originCity}, {artist.originCountry}
                  {artist.formedYear && ` • Est. ${artist.formedYear}`}
                </p>
              )}
            </div>
            <Button
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
              variant="destructive"
              size="sm"
              className="uppercase font-bold"
            >
              Remove
            </Button>
          </div>

          {artist.genres && artist.genres.length > 0 && (
            <div className="mb-2">
              <span className="text-sm font-bold">GENRES: </span>
              <span className="text-sm">{artist.genres.join(", ")}</span>
            </div>
          )}

          {artist.latestReleases && artist.latestReleases.length > 0 && (
            <div className="mb-2">
              <span className="text-sm font-bold">LATEST RELEASES: </span>
              <span className="text-sm">
                {artist.latestReleases.map((r: any) => r.title).join(", ")}
              </span>
            </div>
          )}

          {artist.links && Object.keys(artist.links).length > 0 && (
            <div className="mb-2">
              <span className="text-sm font-bold">LINKS: </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(artist.links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase font-bold underline hover:no-underline"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {artist.curatorNotes && (
            <div className="mt-4 pt-4 border-t border-foreground">
              <span className="text-sm font-bold">CURATOR NOTES: </span>
              <p className="text-sm mt-1">{artist.curatorNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Set New Featured Artist */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="artist-name" className="uppercase font-bold">
            Artist Name
          </Label>
          <Input
            id="artist-name"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="e.g., Yves Tumor, Black Country New Road"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="curator-notes" className="uppercase font-bold">
            Curator Notes (Optional)
          </Label>
          <Textarea
            id="curator-notes"
            value={curatorNotes}
            onChange={(e) => setCuratorNotes(e.target.value)}
            placeholder="Why are you featuring this artist? What should readers know?"
            className="mt-2"
            rows={3}
          />
        </div>

        <Button
          onClick={handleSetArtist}
          disabled={setArtistMutation.isPending}
          className="bg-foreground text-background hover:bg-muted font-bold uppercase w-full"
        >
          {setArtistMutation.isPending ? "Searching..." : "Set Featured Artist"}
        </Button>
      </div>
    </section>
  );
}
