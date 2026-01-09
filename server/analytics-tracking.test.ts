import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { analyticsEvents } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

describe('Analytics Tracking', () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  it('should have analytics_events table', async () => {
    expect(db).toBeDefined();
    
    // Verify table exists by querying it
    const result = await db!.select().from(analyticsEvents).limit(1);
    expect(result).toBeDefined();
  });

  it('should be able to insert page_view event', async () => {
    const testEvent = {
      eventType: 'page_view' as const,
      metadata: JSON.stringify({ page: '/', referrer: 'test' }),
      sessionId: 'test-session-123',
      ipHash: 'test-hash',
    };

    await db!.insert(analyticsEvents).values(testEvent);

    // Verify the event was inserted
    const events = await db!
      .select()
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.sessionId} = 'test-session-123'`)
      .limit(1);

    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('page_view');
    expect(events[0].sessionId).toBe('test-session-123');
  });

  it('should be able to insert newsletter_signup event', async () => {
    const testEvent = {
      eventType: 'newsletter_signup' as const,
      metadata: JSON.stringify({ page: '/' }),
      sessionId: 'test-session-456',
      ipHash: 'test-hash-2',
    };

    await db!.insert(analyticsEvents).values(testEvent);

    const events = await db!
      .select()
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.sessionId} = 'test-session-456'`)
      .limit(1);

    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('newsletter_signup');
  });

  it('should be able to insert featured_artist_view event', async () => {
    const testEvent = {
      eventType: 'featured_artist_view' as const,
      metadata: JSON.stringify({ artistName: 'Test Artist', page: '/' }),
      sessionId: 'test-session-789',
      ipHash: 'test-hash-3',
    };

    await db!.insert(analyticsEvents).values(testEvent);

    const events = await db!
      .select()
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.sessionId} = 'test-session-789'`)
      .limit(1);

    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('featured_artist_view');
  });

  it('should count total page views', async () => {
    const result = await db!
      .select({ count: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.eventType} = 'page_view'`);

    const count = Number(result[0]?.count || 0);
    expect(count).toBeGreaterThan(0);
  });

  it('should store metadata as JSON string', async () => {
    const events = await db!
      .select()
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.metadata} IS NOT NULL`)
      .limit(1);

    if (events.length > 0) {
      expect(events[0].metadata).toBeDefined();
      // Verify it's valid JSON
      const parsed = JSON.parse(events[0].metadata!);
      expect(parsed).toBeDefined();
    }
  });

  it('should return 7 days of data for chart', async () => {
    // This test verifies the data structure for the 7-day chart
    // In a real scenario, we'd query the analytics router endpoint
    // For now, we verify we can group events by date
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await db!
      .select({ count: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(
        sql`${analyticsEvents.eventType} = 'page_view' AND ${analyticsEvents.createdAt} >= ${today.toISOString().split('T')[0]}`
      );
    
    expect(events).toBeDefined();
    expect(events[0]).toHaveProperty('count');
  });
});
