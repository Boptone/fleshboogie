import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET || "change-me-in-production";

/**
 * Cron router for scheduled tasks that can be triggered by external services
 * All endpoints require a secret key for authentication
 */
export const cronRouter = router({
  /**
   * Refresh RSS feeds and update content.json
   * Should be called every 30-60 minutes
   */
  refreshFeeds: publicProcedure
    .input(
      z.object({
        secret: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.secret !== CRON_SECRET) {
        throw new Error("Unauthorized: Invalid cron secret");
      }

      try {
        console.log("[Cron] Starting RSS feed refresh...");
        
        const { stdout, stderr } = await execAsync(
          "cd /home/ubuntu/fleshboogie && node scripts/fetch-feeds.mjs",
          { timeout: 180000 } // 3 minute timeout
        );

        console.log("[Cron] RSS feed refresh completed");
        console.log(stdout);
        
        if (stderr) {
          console.error("[Cron] RSS feed refresh warnings:", stderr);
        }

        return {
          success: true,
          message: "RSS feeds refreshed successfully",
          output: stdout,
        };
      } catch (error: any) {
        console.error("[Cron] RSS feed refresh failed:", error);
        throw new Error(`Failed to refresh feeds: ${error.message}`);
      }
    }),

  /**
   * Send daily newsletter to all daily subscribers
   * Should be called at 6 AM PST (14:00 UTC) every day
   */
  sendDailyNewsletter: publicProcedure
    .input(
      z.object({
        secret: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.secret !== CRON_SECRET) {
        throw new Error("Unauthorized: Invalid cron secret");
      }

      try {
        console.log("[Cron] Starting daily newsletter send...");
        
        const { stdout, stderr } = await execAsync(
          "cd /home/ubuntu/fleshboogie && node scripts/send-daily-newsletter.mjs",
          { timeout: 300000 } // 5 minute timeout
        );

        console.log("[Cron] Daily newsletter send completed");
        console.log(stdout);
        
        if (stderr) {
          console.error("[Cron] Daily newsletter warnings:", stderr);
        }

        return {
          success: true,
          message: "Daily newsletter sent successfully",
          output: stdout,
        };
      } catch (error: any) {
        console.error("[Cron] Daily newsletter send failed:", error);
        throw new Error(`Failed to send daily newsletter: ${error.message}`);
      }
    }),

  /**
   * Send weekly newsletter to all weekly subscribers
   * Should be called at 6 AM PST (14:00 UTC) every Sunday
   */
  sendWeeklyNewsletter: publicProcedure
    .input(
      z.object({
        secret: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.secret !== CRON_SECRET) {
        throw new Error("Unauthorized: Invalid cron secret");
      }

      try {
        console.log("[Cron] Starting weekly newsletter send...");
        
        const { stdout, stderr } = await execAsync(
          "cd /home/ubuntu/fleshboogie && node scripts/send-weekly-newsletter.mjs",
          { timeout: 300000 } // 5 minute timeout
        );

        console.log("[Cron] Weekly newsletter send completed");
        console.log(stdout);
        
        if (stderr) {
          console.error("[Cron] Weekly newsletter warnings:", stderr);
        }

        return {
          success: true,
          message: "Weekly newsletter sent successfully",
          output: stdout,
        };
      } catch (error: any) {
        console.error("[Cron] Weekly newsletter send failed:", error);
        throw new Error(`Failed to send weekly newsletter: ${error.message}`);
      }
    }),

  /**
   * Health check endpoint to verify cron system is working
   */
  healthCheck: publicProcedure
    .input(
      z.object({
        secret: z.string(),
      })
    )
    .query(async ({ input }) => {
      if (input.secret !== CRON_SECRET) {
        throw new Error("Unauthorized: Invalid cron secret");
      }

      return {
        success: true,
        message: "Cron system is healthy",
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }),
});
