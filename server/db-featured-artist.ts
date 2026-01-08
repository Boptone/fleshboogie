/**
 * Database functions for Featured Artist
 */

import { eq } from 'drizzle-orm';
import { getDb } from './db.js';
import { featuredArtist, type FeaturedArtist, type InsertFeaturedArtist } from '../drizzle/schema.js';

/**
 * Get the currently active featured artist
 */
export async function getActiveFeaturedArtist(): Promise<FeaturedArtist | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(featuredArtist)
    .where(eq(featuredArtist.isActive, 1))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Set a new featured artist (deactivates previous one)
 */
export async function setFeaturedArtist(data: InsertFeaturedArtist): Promise<FeaturedArtist> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Deactivate all existing featured artists
  await db
    .update(featuredArtist)
    .set({ isActive: 0 })
    .where(eq(featuredArtist.isActive, 1));
  
  // Insert new featured artist
  const result = await db.insert(featuredArtist).values({
    ...data,
    isActive: 1,
  });
  
  // Fetch and return the newly created artist
  const newArtist = await db
    .select()
    .from(featuredArtist)
    .where(eq(featuredArtist.id, result[0].insertId))
    .limit(1);
  
  return newArtist[0];
}

/**
 * Update featured artist data
 */
export async function updateFeaturedArtist(id: number, data: Partial<InsertFeaturedArtist>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db
    .update(featuredArtist)
    .set(data)
    .where(eq(featuredArtist.id, id));
}

/**
 * Deactivate the current featured artist
 */
export async function deactivateFeaturedArtist(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db
    .update(featuredArtist)
    .set({ isActive: 0 })
    .where(eq(featuredArtist.isActive, 1));
}

/**
 * Get all featured artists (history)
 */
export async function getAllFeaturedArtists(): Promise<FeaturedArtist[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(featuredArtist)
    .orderBy(featuredArtist.featuredAt);
}
