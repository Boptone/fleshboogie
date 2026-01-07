import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, rssSourceMetrics, rssSourceConfig } from "../drizzle/schema";
import { sql } from "drizzle-orm";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

/**
 * Get aggregated RSS source metrics
 * Returns summary of all sources with quality scores
 */
export async function getRSSSourceMetrics() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get RSS metrics: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        source_name: rssSourceConfig.sourceName,
        source_url: rssSourceConfig.sourceUrl,
        category: rssSourceConfig.category,
        is_enabled: rssSourceConfig.isEnabled,
        total_fetches: rssSourceConfig.totalFetches,
        success_rate: rssSourceConfig.successRate,
        average_quality_score: rssSourceConfig.averageQualityScore,
        last_fetch_at: rssSourceConfig.lastFetchAt,
        last_success_at: rssSourceConfig.lastSuccessAt,
      })
      .from(rssSourceConfig)
      .orderBy(sql`${rssSourceConfig.averageQualityScore} DESC`);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get RSS metrics:", error);
    return [];
  }
}

/**
 * Toggle RSS source enabled/disabled status
 */
export async function toggleRSSSource(sourceUrl: string, enabled: boolean) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot toggle RSS source: database not available");
    return;
  }

  try {
    await db
      .update(rssSourceConfig)
      .set({ isEnabled: enabled ? 1 : 0 })
      .where(eq(rssSourceConfig.sourceUrl, sourceUrl));
  } catch (error) {
    console.error("[Database] Failed to toggle RSS source:", error);
    throw error;
  }
}

/**
 * Get detailed metrics for a specific RSS source
 */
export async function getRSSSourceDetails(sourceUrl: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get source details: database not available");
    return null;
  }

  try {
    const config = await db
      .select()
      .from(rssSourceConfig)
      .where(eq(rssSourceConfig.sourceUrl, sourceUrl))
      .limit(1);

    const metrics = await db
      .select()
      .from(rssSourceMetrics)
      .where(eq(rssSourceMetrics.sourceUrl, sourceUrl))
      .orderBy(sql`${rssSourceMetrics.lastFetchAt} DESC`)
      .limit(30);

    return {
      config: config[0] || null,
      recentMetrics: metrics,
    };
  } catch (error) {
    console.error("[Database] Failed to get source details:", error);
    return null;
  }
}
