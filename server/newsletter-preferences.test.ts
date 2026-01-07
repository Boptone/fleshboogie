import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { newsletterSubscribers } from '../drizzle/schema';
import { 
  subscribeToNewsletter, 
  getSubscriberByEmail, 
  updateSubscriberFrequency 
} from './newsletter';
import { eq } from 'drizzle-orm';

describe('Newsletter Preferences', () => {
  const testEmail = `test-prefs-${Date.now()}@example.com`;
  
  beforeAll(async () => {
    // Clean up any existing test data
    const db = await getDb();
    if (db) {
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, testEmail));
    }
  });

  afterAll(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, testEmail));
    }
  });

  it('should create subscriber with default daily frequency', async () => {
    await subscribeToNewsletter(testEmail, 'America/Los_Angeles');
    
    const subscriber = await getSubscriberByEmail(testEmail);
    
    expect(subscriber).toBeDefined();
    expect(subscriber?.email).toBe(testEmail);
    expect(subscriber?.frequency).toBe('daily');
    expect(subscriber?.isActive).toBe(1);
  });

  it('should get subscriber by email', async () => {
    const subscriber = await getSubscriberByEmail(testEmail);
    
    expect(subscriber).toBeDefined();
    expect(subscriber?.email).toBe(testEmail);
  });

  it('should update subscriber frequency to weekly', async () => {
    await updateSubscriberFrequency(testEmail, 'weekly');
    
    const subscriber = await getSubscriberByEmail(testEmail);
    
    expect(subscriber?.frequency).toBe('weekly');
  });

  it('should update subscriber frequency back to daily', async () => {
    await updateSubscriberFrequency(testEmail, 'daily');
    
    const subscriber = await getSubscriberByEmail(testEmail);
    
    expect(subscriber?.frequency).toBe('daily');
  });

  it('should return null for non-existent email', async () => {
    const subscriber = await getSubscriberByEmail('nonexistent@example.com');
    
    expect(subscriber).toBeNull();
  });
});
