import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { InsertNewsletterSubscriber, newsletterSubscribers } from "../drizzle/schema";
import { getDb } from "./db";
import { addSubscriberToMailchimp } from "./mailchimp";

/**
 * Subscribe a new email to The Boogie Blast newsletter
 */
export async function subscribeToNewsletter(email: string, timezone: string = "America/New_York") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const unsubscribeToken = nanoid(32);

  const subscriber: InsertNewsletterSubscriber = {
    email: email.toLowerCase().trim(),
    timezone,
    unsubscribeToken,
  };

  // First, sync to Mailchimp
  try {
    await addSubscriberToMailchimp(email, timezone);
  } catch (mailchimpError: any) {
    console.error('Mailchimp sync failed:', mailchimpError.message);
    // Continue to add to local database even if Mailchimp fails
  }

  // Then add to local database
  try {
    await db.insert(newsletterSubscribers).values(subscriber);
    return { success: true, unsubscribeToken };
  } catch (error: any) {
    // Handle duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error("This email is already subscribed");
    }
    throw error;
  }
}

/**
 * Unsubscribe an email using the unsubscribe token
 */
export async function unsubscribeFromNewsletter(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .update(newsletterSubscribers)
    .set({ isActive: 0 })
    .where(eq(newsletterSubscribers.unsubscribeToken, token));

  return result;
}

/**
 * Get all active subscribers for a specific timezone
 */
export async function getSubscribersByTimezone(timezone: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const subscribers = await db
    .select()
    .from(newsletterSubscribers)
    .where(and(
      eq(newsletterSubscribers.timezone, timezone),
      eq(newsletterSubscribers.isActive, 1)
    ));

  return subscribers;
}

/**
 * Get all active subscribers
 */
export async function getAllActiveSubscribers() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const subscribers = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, 1));

  return subscribers;
}

/**
 * Update last email sent timestamp for a subscriber
 */
export async function updateLastEmailSent(subscriberId: number) {
  const db = await getDb();
  if (!db) {
    return;
  }

  await db
    .update(newsletterSubscribers)
    .set({ lastEmailSent: new Date() })
    .where(eq(newsletterSubscribers.id, subscriberId));
}
