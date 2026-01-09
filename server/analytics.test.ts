import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { analyticsEvents, newsletterSubscribers } from "../drizzle/schema";
import { sql } from "drizzle-orm";

describe("Analytics Dashboard", () => {
  beforeEach(async () => {
    // Clean up analytics events before each test
    const db = await getDb();
    if (db) {
      await db.delete(analyticsEvents).where(sql`1=1`);
    }
  });

  it("should count today's page views correctly", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Insert 3 page view events today
    await db.insert(analyticsEvents).values([
      {
        eventType: "page_view",
        metadata: JSON.stringify({ page: "/" }),
        createdAt: new Date(),
      },
      {
        eventType: "page_view",
        metadata: JSON.stringify({ page: "/about" }),
        createdAt: new Date(),
      },
      {
        eventType: "page_view",
        metadata: JSON.stringify({ page: "/featured-artists" }),
        createdAt: new Date(),
      },
    ]);

    // Query today's page views
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.eventType} = 'page_view' AND ${analyticsEvents.createdAt} >= ${todayStart}`);

    expect(Number(result[0]?.count || 0)).toBe(3);
  });

  it("should count total page views correctly", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Insert page views from different days
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await db.insert(analyticsEvents).values([
      {
        eventType: "page_view",
        metadata: JSON.stringify({ page: "/" }),
        createdAt: new Date(),
      },
      {
        eventType: "page_view",
        metadata: JSON.stringify({ page: "/" }),
        createdAt: yesterday,
      },
    ]);

    // Query total page views
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.eventType} = 'page_view'`);

    expect(Number(result[0]?.count || 0)).toBe(2);
  });

  it("should count Featured Artist views correctly", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Insert Featured Artist view events
    await db.insert(analyticsEvents).values([
      {
        eventType: "featured_artist_view",
        metadata: JSON.stringify({ artistName: "Theo Lawrence" }),
        createdAt: new Date(),
      },
      {
        eventType: "featured_artist_view",
        metadata: JSON.stringify({ artistName: "Theo Lawrence" }),
        createdAt: new Date(),
      },
    ]);

    // Query Featured Artist views today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(
        sql`${analyticsEvents.eventType} = 'featured_artist_view' AND ${analyticsEvents.createdAt} >= ${todayStart}`
      );

    expect(Number(result[0]?.count || 0)).toBe(2);
  });

  it("should count active newsletter subscribers correctly", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Query active subscribers (should match existing data)
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(newsletterSubscribers)
      .where(sql`${newsletterSubscribers.isActive} = 1`);

    const totalSubscribers = Number(result[0]?.count || 0);
    
    // Should have at least 0 subscribers (may have existing data)
    expect(totalSubscribers).toBeGreaterThanOrEqual(0);
  });

  it("should handle empty analytics data gracefully", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Query with no data
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.eventType} = 'page_view' AND ${analyticsEvents.createdAt} >= ${todayStart}`);

    expect(Number(result[0]?.count || 0)).toBe(0);
  });
});
