import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { FeaturedArtistSection } from "@/components/FeaturedArtistSection";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

interface LinkItem {
  title: string;
  url: string;
  timestamp?: string;
  pinned?: boolean;
}

interface ContentData {
  splash: {
    headline: string;
    url: string;
    image?: string;
    pinned?: boolean;
  };
  mainColumn: LinkItem[];
  column1: LinkItem[];
  column2: LinkItem[];
  column3: LinkItem[];
}

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [content, setContent] = useState<ContentData>({
    splash: { headline: "", url: "", image: "" },
    mainColumn: [],
    column1: [],
    column2: [],
    column3: [],
  });

  // Fetch current content
  const { data: currentContent, refetch } = trpc.content.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (currentContent) {
      setContent(currentContent);
    }
  }, [currentContent]);

  // Save content mutation
  const saveMutation = trpc.content.update.useMutation({
    onSuccess: () => {
      toast.success("Content saved successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(content);
  };

  const addLink = (section: 'mainColumn' | 'column1' | 'column2' | 'column3') => {
    setContent(prev => ({
      ...prev,
      [section]: [...prev[section], { title: "", url: "", timestamp: "" }]
    }));
  };

  const removeLink = (section: 'mainColumn' | 'column1' | 'column2' | 'column3', index: number) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const updateLink = (
    section: 'mainColumn' | 'column1' | 'column2' | 'column3',
    index: number,
    field: keyof LinkItem,
    value: string
  ) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-xl font-bold">LOADING...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-black uppercase">Admin Access Required</h1>
        <p className="text-lg">You must be logged in as the site owner to access this page.</p>
        <Button
          onClick={() => window.location.href = getLoginUrl()}
          className="bg-foreground text-background hover:bg-muted font-bold uppercase"
        >
          Log In
        </Button>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-black uppercase">Access Denied</h1>
        <p className="text-lg">Only the site owner can access the admin panel.</p>
        <Button
          onClick={() => window.location.href = '/'}
          className="bg-foreground text-background hover:bg-muted font-bold uppercase"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-4 border-foreground py-6 mb-8">
        <div className="container">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              FLESHBOOGIE ADMIN
            </h1>
            <div className="flex gap-4">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="uppercase font-bold"
              >
                View Site
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-foreground text-background hover:bg-muted font-bold uppercase"
              >
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container pb-16 space-y-12">
        {/* Analytics Dashboard */}
        <AnalyticsDashboard />
        
        {/* Featured Artist */}
        <FeaturedArtistSection />
        
        {/* Splash Headline */}
        <section className="border-2 border-foreground p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black uppercase">Splash Headline</h2>
            <Button
              onClick={() => setContent(prev => ({
                ...prev,
                splash: { ...prev.splash, pinned: !prev.splash.pinned }
              }))}
              variant={content.splash.pinned ? "default" : "outline"}
              className="uppercase font-bold"
            >
              {content.splash.pinned ? "📌 PINNED" : "PIN"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {content.splash.pinned ? "This story will stay in place (won't auto-rotate)" : "This story will auto-rotate every 15 minutes"}
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="splash-headline" className="uppercase font-bold">Headline</Label>
              <Textarea
                id="splash-headline"
                value={content.splash.headline}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  splash: { ...prev.splash, headline: e.target.value }
                }))}
                className="font-mono mt-2"
                rows={2}
                placeholder="MAIN HEADLINE IN ALL CAPS"
              />
            </div>
            <div>
              <Label htmlFor="splash-url" className="uppercase font-bold">URL</Label>
              <Input
                id="splash-url"
                type="url"
                value={content.splash.url}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  splash: { ...prev.splash, url: e.target.value }
                }))}
                className="font-mono mt-2"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        {/* Main Column */}
        <section className="border-2 border-foreground p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black uppercase">Main Column</h2>
            <Button
              onClick={() => addLink('mainColumn')}
              variant="outline"
              className="uppercase font-bold"
            >
              + Add Link
            </Button>
          </div>
          <div className="space-y-4">
            {content.mainColumn.map((link, index) => (
              <div key={index} className="border border-foreground p-4 space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-muted-foreground">STORY #{index + 1}</span>
                  <Button
                    onClick={() => setContent(prev => ({
                      ...prev,
                      mainColumn: prev.mainColumn.map((item, i) =>
                        i === index ? { ...item, pinned: !item.pinned } : item
                      )
                    }))}
                    variant={link.pinned ? "default" : "outline"}
                    size="sm"
                    className="uppercase font-bold text-xs"
                  >
                    {link.pinned ? "📌 PINNED" : "PIN"}
                  </Button>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={link.title}
                      onChange={(e) => updateLink('mainColumn', index, 'title', e.target.value)}
                      placeholder="Link title"
                      className="font-mono"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink('mainColumn', index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="font-mono"
                    />
                    <Input
                      value={link.timestamp || ''}
                      onChange={(e) => updateLink('mainColumn', index, 'timestamp', e.target.value)}
                      placeholder="14:32 (optional)"
                      className="font-mono w-32"
                    />
                  </div>
                  <Button
                    onClick={() => removeLink('mainColumn', index)}
                    variant="outline"
                    size="sm"
                    className="uppercase font-bold"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['column1', 'column2', 'column3'] as const).map((columnKey, colIndex) => (
            <section key={columnKey} className="border-2 border-foreground p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black uppercase">Column {colIndex + 1}</h2>
                <Button
                  onClick={() => addLink(columnKey)}
                  variant="outline"
                  size="sm"
                  className="uppercase font-bold text-xs"
                >
                  + Add
                </Button>
              </div>
              <div className="space-y-4">
                {content[columnKey].map((link, index) => (
                  <div key={index} className="border border-foreground p-3 space-y-2">
                    <Input
                      value={link.title}
                      onChange={(e) => updateLink(columnKey, index, 'title', e.target.value)}
                      placeholder="Link title"
                      className="font-mono text-sm"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(columnKey, index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => removeLink(columnKey, index)}
                      variant="outline"
                      size="sm"
                      className="w-full uppercase font-bold text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
