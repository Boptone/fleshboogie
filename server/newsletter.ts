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

/**
 * Get subscriber by email address
 */
export async function getSubscriberByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email.toLowerCase().trim()))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Update subscriber frequency preference
 */
export async function updateSubscriberFrequency(email: string, frequency: "daily" | "weekly") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .update(newsletterSubscribers)
    .set({ frequency })
    .where(eq(newsletterSubscribers.email, email.toLowerCase().trim()));

  return result;
}

/**
 * Send welcome email to new subscriber
 */
export async function sendWelcomeEmail(email: string, frequency: "daily" | "weekly" = "daily") {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    throw new Error("Email service not configured");
  }

  const preferencesUrl = `https://fleshboogie.com/preferences?email=${encodeURIComponent(email)}`;
  
  const frequencyText = frequency === "daily" 
    ? "Your first Boogie Blast arrives tomorrow at 6 AM PST (9 AM EST)."
    : "Your first Boogie Blast arrives this Sunday at 6 AM PST (9 AM EST).";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to FLESHBOOGIE</title>
  <style>
    /* Prevent dark mode from affecting email */
    :root {
      color-scheme: light only;
      supported-color-schemes: light;
    }
    
    /* Prevent iOS/Android dark mode overrides */
    @media (prefers-color-scheme: dark) {
      body, table, td {
        background-color: #ffffff !important;
        color: #1a1a1a !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Courier New', monospace; background-color: #f5f5f0 !important; color: #1a1a1a !important;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 40px 30px; border-bottom: 4px solid #1a1a1a; background-color: #f5f5f0;">
        <h1 style="margin: 0; font-size: 48px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #1a1a1a;">
          FLESHBOOGIE
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">
          Music • Culture • News • Whatever
        </p>
      </td>
    </tr>

    <!-- Welcome Message -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 900; text-transform: uppercase; color: #1a1a1a;">
          Welcome to The Boogie Blast!
        </h2>
        
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1a1a1a;">
          Thanks for subscribing! You're now part of the FLESHBOOGIE community.
        </p>
        
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1a1a1a;">
          ${frequencyText}
        </p>
        
        <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1a1a1a;">
          Every edition brings you the best links from across music, culture, film, tech, and art—curated from 68 sources and filtered to skip the noise.
        </p>

        <!-- CTA Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 2px solid #1a1a1a; background-color: #f5f5f0;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; text-transform: uppercase; color: #1a1a1a;">
                Manage Your Preferences
              </p>
              <a href="${preferencesUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
                Update Frequency
              </a>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666;">
          You can switch between daily and weekly delivery anytime, or unsubscribe if it's not for you. No hard feelings.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 30px; border-top: 2px solid #1a1a1a; background-color: #f5f5f0;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
          <strong>FLESHBOOGIE</strong><br>
          Music • Culture • News • Whatever
        </p>
        <p style="margin: 0; font-size: 11px; color: #999;">
          <a href="${preferencesUrl}" style="color: #666; text-decoration: underline;">Manage preferences</a> • 
          <a href="https://fleshboogie.com" style="color: #666; text-decoration: underline;">Visit site</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FLESHBOOGIE <hello@fleshboogie.com>",
        to: [email],
        subject: "Welcome to The Boogie Blast 🎉",
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send welcome email:", error);
      throw new Error(`Failed to send welcome email: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Welcome email sent to ${email} (${result.id})`);
    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}
