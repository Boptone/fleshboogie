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
  
  // Manual editing fields
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [manualBio, setManualBio] = useState("");
  const [manualGenres, setManualGenres] = useState("");
  const [manualOriginCity, setManualOriginCity] = useState("");
  const [manualOriginCountry, setManualOriginCountry] = useState("");
  const [manualFormedYear, setManualFormedYear] = useState("");
  const [manualWebsite, setManualWebsite] = useState("");
  const [manualBandcamp, setManualBandcamp] = useState("");
  const [manualSpotify, setManualSpotify] = useState("");
  const [manualSoundcloud, setManualSoundcloud] = useState("");
  const [manualInstagram, setManualInstagram] = useState("");
  const [manualTwitter, setManualTwitter] = useState("");
  const [manualReleases, setManualReleases] = useState("");

  // Get current featured artist
  const { data: currentArtist, refetch } = trpc.featuredArtist.getCurrent.useQuery();

  // Set featured artist mutation
  const setArtistMutation = trpc.featuredArtist.setByName.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Featured artist set to: ${data.artist?.artistName}`);
        
        // Populate manual fields with MusicBrainz data for editing
        const artist = data.artist;
        if (artist) {
          setManualBio(artist.bio || "");
          setManualGenres(artist.genres?.join(", ") || "");
          setManualOriginCity(artist.originCity || "");
          setManualOriginCountry(artist.originCountry || "");
          setManualFormedYear(artist.formedYear?.toString() || "");
          setManualWebsite(artist.links?.website || "");
          setManualBandcamp(artist.links?.bandcamp || "");
          setManualSpotify(artist.links?.spotify || "");
          setManualSoundcloud(artist.links?.soundcloud || "");
          setManualInstagram(artist.links?.instagram || "");
          setManualTwitter(artist.links?.twitter || "");
          setManualReleases(
            artist.latestReleases
              ?.map((r: any) => `${r.title} (${r.type}, ${r.date})`)
              .join("\n") || ""
          );
          setShowManualEdit(true);
        }
        
        setArtistName("");
        refetch();
      } else {
        toast.error(data.error || "Artist not found in MusicBrainz. You can still add them manually.");
        setShowManualEdit(true);
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
      setShowManualEdit(true);
    },
  });

  // Deactivate featured artist mutation
  const deactivateMutation = trpc.featuredArtist.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Featured artist deactivated");
      setShowManualEdit(false);
      resetManualFields();
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const resetManualFields = () => {
    setManualBio("");
    setManualGenres("");
    setManualOriginCity("");
    setManualOriginCountry("");
    setManualFormedYear("");
    setManualWebsite("");
    setManualBandcamp("");
    setManualSpotify("");
    setManualSoundcloud("");
    setManualInstagram("");
    setManualTwitter("");
    setManualReleases("");
  };

  const handleSearchArtist = () => {
    if (!artistName.trim()) {
      toast.error("Please enter an artist name");
      return;
    }

    setArtistMutation.mutate({
      artistName: artistName.trim(),
      curatorNotes: curatorNotes.trim() || undefined,
    });
  };

  // Manual save mutation
  const saveManualMutation = trpc.featuredArtist.setManual.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Featured artist set to: ${data.artist?.artistName}`);
        setShowManualEdit(false);
        resetManualFields();
        setArtistName("");
        setCuratorNotes("");
        refetch();
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSaveManual = () => {
    if (!artistName.trim()) {
      toast.error("Please enter an artist name");
      return;
    }

    // Parse releases
    const releases = manualReleases
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const match = line.match(/^(.+?)\s*\(([^,]+),\s*([^)]+)\)$/);
        if (match) {
          return { title: match[1].trim(), type: match[2].trim(), date: match[3].trim() };
        }
        return { title: line.trim(), type: "", date: "" };
      });

    // Parse genres
    const genres = manualGenres
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g);

    saveManualMutation.mutate({
      artistName: artistName.trim(),
      bio: manualBio.trim() || undefined,
      genres: genres.length > 0 ? genres : undefined,
      originCity: manualOriginCity.trim() || undefined,
      originCountry: manualOriginCountry.trim() || undefined,
      formedYear: manualFormedYear ? parseInt(manualFormedYear) : undefined,
      website: manualWebsite.trim() || undefined,
      bandcamp: manualBandcamp.trim() || undefined,
      spotify: manualSpotify.trim() || undefined,
      soundcloud: manualSoundcloud.trim() || undefined,
      instagram: manualInstagram.trim() || undefined,
      twitter: manualTwitter.trim() || undefined,
      latestReleases: releases.length > 0 ? releases : undefined,
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
      <h2 className="text-2xl font-black uppercase mb-4">Fleshboogie Featured Artist Spotlight ⚡</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Set a featured artist to highlight on the homepage. Search MusicBrainz first, then manually edit or add missing data.
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
          onClick={handleSearchArtist}
          disabled={setArtistMutation.isPending}
          className="bg-foreground text-background hover:bg-muted font-bold uppercase w-full"
        >
          {setArtistMutation.isPending ? "Searching MusicBrainz..." : "Search & Set Featured Artist"}
        </Button>

        <Button
          onClick={() => setShowManualEdit(!showManualEdit)}
          variant="outline"
          className="font-bold uppercase w-full"
        >
          {showManualEdit ? "Hide Manual Edit" : "Manual Edit / Add Artist"}
        </Button>

        {/* Manual Editing Section */}
        {showManualEdit && (
          <div className="mt-6 pt-6 border-t-2 border-foreground space-y-4">
            <h3 className="text-lg font-black uppercase">Manual Edit / Add Missing Data</h3>
            <p className="text-xs text-muted-foreground">
              Edit or add data below if MusicBrainz is missing information for this underground artist.
            </p>

            <div>
              <Label htmlFor="manual-bio" className="uppercase font-bold text-xs">
                Bio / Description
              </Label>
              <Textarea
                id="manual-bio"
                value={manualBio}
                onChange={(e) => setManualBio(e.target.value)}
                placeholder="Write a custom bio for this artist..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manual-genres" className="uppercase font-bold text-xs">
                  Genres (comma-separated)
                </Label>
                <Input
                  id="manual-genres"
                  value={manualGenres}
                  onChange={(e) => setManualGenres(e.target.value)}
                  placeholder="e.g., indie rock, post-punk"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="manual-formed-year" className="uppercase font-bold text-xs">
                  Formed Year
                </Label>
                <Input
                  id="manual-formed-year"
                  value={manualFormedYear}
                  onChange={(e) => setManualFormedYear(e.target.value)}
                  placeholder="e.g., 2015"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manual-origin-city" className="uppercase font-bold text-xs">
                  Origin City
                </Label>
                <Input
                  id="manual-origin-city"
                  value={manualOriginCity}
                  onChange={(e) => setManualOriginCity(e.target.value)}
                  placeholder="e.g., Brooklyn"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="manual-origin-country" className="uppercase font-bold text-xs">
                  Origin Country
                </Label>
                <Input
                  id="manual-origin-country"
                  value={manualOriginCountry}
                  onChange={(e) => setManualOriginCountry(e.target.value)}
                  placeholder="e.g., US"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase font-bold text-xs">Links</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={manualWebsite}
                  onChange={(e) => setManualWebsite(e.target.value)}
                  placeholder="Website URL"
                  className="text-sm"
                />
                <Input
                  value={manualBandcamp}
                  onChange={(e) => setManualBandcamp(e.target.value)}
                  placeholder="Bandcamp URL"
                  className="text-sm"
                />
                <Input
                  value={manualSpotify}
                  onChange={(e) => setManualSpotify(e.target.value)}
                  placeholder="Spotify URL"
                  className="text-sm"
                />
                <Input
                  value={manualSoundcloud}
                  onChange={(e) => setManualSoundcloud(e.target.value)}
                  placeholder="SoundCloud URL"
                  className="text-sm"
                />
                <Input
                  value={manualInstagram}
                  onChange={(e) => setManualInstagram(e.target.value)}
                  placeholder="Instagram URL"
                  className="text-sm"
                />
                <Input
                  value={manualTwitter}
                  onChange={(e) => setManualTwitter(e.target.value)}
                  placeholder="Twitter/X URL"
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="manual-releases" className="uppercase font-bold text-xs">
                Latest Releases (one per line)
              </Label>
              <Textarea
                id="manual-releases"
                value={manualReleases}
                onChange={(e) => setManualReleases(e.target.value)}
                placeholder={"Album Title (album, 2024-03-15)\nSingle Name (single, 2024-01-10)"}
                className="mt-2 font-mono text-xs"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: Title (type, YYYY-MM-DD)
              </p>
            </div>

            <Button
              onClick={handleSaveManual}
              disabled={saveManualMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase w-full"
            >
              {saveManualMutation.isPending ? "Saving..." : "Save Manual Edits"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
