import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

/**
 * RSS Metrics Router
 * Provides endpoints for monitoring RSS source quality and performance
 */

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const rssMetricsRouter = router({
  /**
   * Get aggregated metrics for all RSS sources
   */
  getMetrics: adminProcedure.query(async () => {
    const sources = await db.getRSSSourceMetrics();
    return { sources };
  }),

  /**
   * Toggle enabled/disabled status for an RSS source
   */
  toggleSource: adminProcedure
    .input(
      z.object({
        sourceUrl: z.string().url(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      await db.toggleRSSSource(input.sourceUrl, input.enabled);
      return { success: true };
    }),

  /**
   * Get detailed metrics for a specific source
   */
  getSourceDetails: adminProcedure
    .input(z.object({ sourceUrl: z.string().url() }))
    .query(async ({ input }) => {
      const metrics = await db.getRSSSourceDetails(input.sourceUrl);
      return metrics;
    }),
});
