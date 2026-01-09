import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { analyticsEvents, newsletterSubscribers } from "../../drizzle/schema";
import { sql, and, gte } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

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

  /**
   * Track an analytics event (public endpoint - no auth required)
   */
  trackEvent: publicProcedure
    .input(
      z.object({
        eventType: z.enum(["page_view", "newsletter_signup", "featured_artist_view"]),
        metadata: z.record(z.string(), z.any()).optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database unavailable" };
      }

      try {
        // Hash IP address for privacy (if available from request)
        let ipHash: string | undefined;
        const ip = ctx.req?.headers["x-forwarded-for"] || ctx.req?.socket?.remoteAddress;
        if (ip) {
          ipHash = crypto.createHash("sha256").update(String(ip)).digest("hex");
        }

        await db.insert(analyticsEvents).values({
          eventType: input.eventType,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          sessionId: input.sessionId,
          ipHash,
        });

        return { success: true };
      } catch (error) {
        console.error("[Analytics] Failed to track event:", error);
        return { success: false, error: "Failed to track event" };
      }
    }),
});
