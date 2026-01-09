import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { analyticsEvents, newsletterSubscribers } from "../../drizzle/schema";
import { sql, and, gte } from "drizzle-orm";

/**
 * Analytics Router
 * Provides endpoints for tracking and retrieving analytics data
 */
export const analyticsRouter = router({
  /**
   * Get dashboard stats (today's visits, total visits, new subscribers, Featured Artist views)
   */
  getDashboardStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        todayVisits: 0,
        totalVisits: 0,
        newSubscribersToday: 0,
        totalSubscribers: 0,
        featuredArtistViews: 0,
      };
    }

    try {
      // Get today's date at midnight (start of day)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Today's page views
      const todayVisitsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(analyticsEvents)
        .where(
          and(
            sql`${analyticsEvents.eventType} = 'page_view'`,
            gte(analyticsEvents.createdAt, todayStart)
          )
        );
      const todayVisits = Number(todayVisitsResult[0]?.count || 0);

      // Total page views (all time)
      const totalVisitsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.eventType} = 'page_view'`);
      const totalVisits = Number(totalVisitsResult[0]?.count || 0);

      // New subscribers today
      const newSubscribersTodayResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(newsletterSubscribers)
        .where(gte(newsletterSubscribers.subscribedAt, todayStart));
      const newSubscribersToday = Number(newSubscribersTodayResult[0]?.count || 0);

      // Total subscribers (active only)
      const totalSubscribersResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(newsletterSubscribers)
        .where(sql`${newsletterSubscribers.isActive} = 1`);
      const totalSubscribers = Number(totalSubscribersResult[0]?.count || 0);

      // Featured Artist views today
      const featuredArtistViewsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(analyticsEvents)
        .where(
          and(
            sql`${analyticsEvents.eventType} = 'featured_artist_view'`,
            gte(analyticsEvents.createdAt, todayStart)
          )
        );
      const featuredArtistViews = Number(featuredArtistViewsResult[0]?.count || 0);

      return {
        todayVisits,
        totalVisits,
        newSubscribersToday,
        totalSubscribers,
        featuredArtistViews,
      };
    } catch (error) {
      console.error("[Analytics] Failed to get dashboard stats:", error);
      return {
        todayVisits: 0,
        totalVisits: 0,
        newSubscribersToday: 0,
        totalSubscribers: 0,
        featuredArtistViews: 0,
      };
    }
  }),
});
