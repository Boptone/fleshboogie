import { trpc } from "../lib/trpc";

/**
 * Simple Analytics Dashboard
 * Displays real-time site metrics at the top of the /admin page
 */
export default function AnalyticsDashboard() {
  const { data: stats, isLoading } = trpc.analytics.getDashboardStats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="bg-white border-4 border-black p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">ANALYTICS</h2>
        <div className="text-gray-500">Loading stats...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: "TODAY'S VISITS",
      value: stats?.todayVisits || 0,
      subtext: `${stats?.totalVisits || 0} total`,
    },
    {
      label: "NEW SUBSCRIBERS",
      value: stats?.newSubscribersToday || 0,
      subtext: `${stats?.totalSubscribers || 0} total`,
    },
    {
      label: "FEATURED ARTIST VIEWS",
      value: stats?.featuredArtistViews || 0,
      subtext: "today",
    },
  ];

  return (
    <div className="bg-white border-4 border-black p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">ANALYTICS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div 
            key={index}
            className="border-2 border-black p-4 bg-gray-50"
          >
            <div className="text-sm font-bold text-gray-600 mb-2">
              {card.label}
            </div>
            <div className="text-4xl font-bold mb-1">
              {card.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {card.subtext}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
