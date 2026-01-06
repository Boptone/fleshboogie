import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { subscribeToNewsletter, unsubscribeFromNewsletter } from "../newsletter";

export const newsletterRouter = router({
  /**
   * Subscribe to The Boogie Blast newsletter
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        timezone: z.string().default("America/New_York"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await subscribeToNewsletter(input.email, input.timezone);
        return {
          success: true,
          message: "Successfully subscribed to The Boogie Blast!",
        };
      } catch (error: any) {
        if (error.message === "This email is already subscribed") {
          return {
            success: false,
            message: "This email is already subscribed to The Boogie Blast.",
          };
        }
        throw error;
      }
    }),

  /**
   * Unsubscribe from newsletter using token
   */
  unsubscribe: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await unsubscribeFromNewsletter(input.token);
      return {
        success: true,
        message: "Successfully unsubscribed from The Boogie Blast.",
      };
    }),
});
