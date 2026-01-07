import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { subscribeToNewsletter, unsubscribeFromNewsletter, getSubscriberByEmail, updateSubscriberFrequency, sendWelcomeEmail } from "../newsletter";

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
        
        // Send welcome email immediately after successful subscription
        try {
          await sendWelcomeEmail(input.email, "daily");
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail the subscription if welcome email fails
        }
        
        return {
          success: true,
          message: "Successfully subscribed to The Boogie Blast! Check your email for a welcome message.",
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

  /**
   * Get subscriber preferences by email
   */
  getPreferences: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      })
    )
    .query(async ({ input }) => {
      const subscriber = await getSubscriberByEmail(input.email);
      if (!subscriber) {
        throw new Error("Email not found in our subscriber list");
      }
      return {
        email: subscriber.email,
        frequency: subscriber.frequency,
        isActive: subscriber.isActive === 1,
      };
    }),

  /**
   * Update subscriber frequency preference
   */
  updateFrequency: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        frequency: z.enum(["daily", "weekly"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateSubscriberFrequency(input.email, input.frequency);
      return {
        success: true,
        message: `Preferences updated! You'll now receive The Boogie Blast ${input.frequency}.`,
      };
    }),
});
