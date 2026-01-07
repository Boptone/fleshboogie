import { useState } from 'react';
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from '@/components/ui/button';
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SourceMetrics {
  source_name: string;
  source_url: string;
  category: string;
  is_enabled: number;
  total_fetches: number;
  success_rate: number;
  average_quality_score: number;
  last_fetch_at: Date | null;
  last_success_at: Date | null;
}

export default function RSSMetrics() {
  const { user, loading, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<'all' | 'music' | 'tech' | 'entertainment'>('all');
  const [sortBy, setSortBy] = useState<'quality' | 'success' | 'name'>('quality');

  const { data: metricsData, isLoading: metricsLoading, refetch } = trpc.rssMetrics.getMetrics.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  const toggleMutation = trpc.rssMetrics.toggleSource.useMutation({
    onSuccess: () => {
      toast.success("Source status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to toggle source: ${error.message}`);
    },
  });

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
        <p className="text-lg">Only the site owner can access RSS metrics.</p>
        <Button
          onClick={() => window.location.href = '/'}
          className="bg-foreground text-background hover:bg-muted font-bold uppercase"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  const sources = metricsData?.sources || [];

  const filteredSources = sources
    .filter(s => filter === 'all' || s.category === filter)
    .sort((a, b) => {
      if (sortBy === 'quality') return b.average_quality_score - a.average_quality_score;
      if (sortBy === 'success') return b.success_rate - a.success_rate;
      return a.source_name.localeCompare(b.source_name);
    });

  const getQualityColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-4 border-foreground py-6 mb-8">
        <div className="container">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              RSS METRICS
            </h1>
            <div className="flex gap-4">
              <Button
                onClick={() => window.location.href = '/admin'}
                variant="outline"
                className="uppercase font-bold"
              >
                Admin Panel
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="uppercase font-bold"
              >
                View Site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container pb-16">
        {metricsLoading ? (
          <div className="text-center py-12">
            <p className="text-xl font-bold">LOADING METRICS...</p>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="flex gap-4 mb-8 flex-wrap">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className="uppercase font-bold"
                >
                  All Sources
                </Button>
                <Button
                  variant={filter === 'music' ? 'default' : 'outline'}
                  onClick={() => setFilter('music')}
                  className="uppercase font-bold"
                >
                  Music
                </Button>
                <Button
                  variant={filter === 'tech' ? 'default' : 'outline'}
                  onClick={() => setFilter('tech')}
                  className="uppercase font-bold"
                >
                  Tech
                </Button>
                <Button
                  variant={filter === 'entertainment' ? 'default' : 'outline'}
                  onClick={() => setFilter('entertainment')}
                  className="uppercase font-bold"
                >
                  Entertainment
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'quality' ? 'default' : 'outline'}
                  onClick={() => setSortBy('quality')}
                  className="uppercase font-bold"
                >
                  By Quality
                </Button>
                <Button
                  variant={sortBy === 'success' ? 'default' : 'outline'}
                  onClick={() => setSortBy('success')}
                  className="uppercase font-bold"
                >
                  By Success
                </Button>
                <Button
                  variant={sortBy === 'name' ? 'default' : 'outline'}
                  onClick={() => setSortBy('name')}
                  className="uppercase font-bold"
                >
                  By Name
                </Button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="border-2 border-foreground p-4">
                <div className="text-sm uppercase font-bold mb-2">Total Sources</div>
                <div className="text-3xl font-black">{sources.length}</div>
              </div>
              <div className="border-2 border-foreground p-4">
                <div className="text-sm uppercase font-bold mb-2">Active Sources</div>
                <div className="text-3xl font-black">
                  {sources.filter(s => s.is_enabled === 1).length}
                </div>
              </div>
              <div className="border-2 border-foreground p-4">
                <div className="text-sm uppercase font-bold mb-2">Avg Quality</div>
                <div className="text-3xl font-black">
                  {sources.length > 0
                    ? Math.round(
                        sources.reduce((sum, s) => sum + s.average_quality_score, 0) / sources.length
                      )
                    : 0}
                </div>
              </div>
              <div className="border-2 border-foreground p-4">
                <div className="text-sm uppercase font-bold mb-2">Avg Success</div>
                <div className="text-3xl font-black">
                  {sources.length > 0
                    ? Math.round(
                        sources.reduce((sum, s) => sum + s.success_rate, 0) / sources.length
                      )
                    : 0}%
                </div>
              </div>
            </div>

            {/* Source List */}
            <div className="space-y-4">
              {filteredSources.map((source) => (
                <div key={source.source_url} className="border-2 border-foreground p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-black uppercase mb-1">{source.source_name}</h3>
                      <p className="text-sm font-mono break-all">{source.source_url}</p>
                    </div>
                    <Button
                      variant={source.is_enabled === 1 ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleMutation.mutate({ sourceUrl: source.source_url, enabled: source.is_enabled === 0 })}
                      disabled={toggleMutation.isPending}
                      className="uppercase font-bold ml-4"
                    >
                      {source.is_enabled === 1 ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Category</div>
                      <div className="font-bold">{source.category}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Quality Score</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getQualityColor(source.average_quality_score)}`} />
                        <span className="font-black">{source.average_quality_score}/100</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Success Rate</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSuccessColor(source.success_rate)}`} />
                        <span className="font-black">{source.success_rate}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Total Fetches</div>
                      <span className="font-black">{source.total_fetches}</span>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Last Success</div>
                      <span className="text-sm font-bold">
                        {source.last_success_at
                          ? new Date(source.last_success_at).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
